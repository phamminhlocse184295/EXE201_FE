import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Html } from "@react-three/drei";
import { damp3 } from "maath/easing";
import * as THREE from "three";
import ChibiSkeleton3D from "./ChibiSkeleton3D.jsx";
import { collectClientAnchors } from "./railAnchors.js";

const INTERACTIVE =
  'button, a[href], input, textarea, select, [role="button"], [contenteditable="true"], .ant-btn, .ant-input, .mgr-nav-link, .admin-nav-link, .ant-select-selector, .ant-pagination-item, .ant-table, .ant-tabs-tab, label, [data-skel-attract]';

function pathTarget(t, seed, pathKey, vw, vh) {
  const margin = 0.85;
  const mx = vw / 2 - margin;
  const my = vh / 2 - margin;
  const s = seed * 1.7;
  switch (pathKey) {
    case "circle":
      return new THREE.Vector3(Math.cos(t + s) * mx * 0.55, Math.sin(t + s) * my * 0.5, 0);
    case "oval":
      return new THREE.Vector3(Math.cos(t * 0.9 + s) * mx * 0.6, Math.sin(t * 1.1 + s) * my * 0.42, 0);
    case "figure8": {
      const a = t * 0.85 + s;
      return new THREE.Vector3(Math.sin(a) * mx * 0.5, Math.sin(a * 2) * my * 0.32, 0);
    }
    case "zigzag": {
      const u = (t * 0.4 + s) % (Math.PI * 2);
      const x = (u / (Math.PI * 2)) * 2 - 1;
      return new THREE.Vector3(x * mx * 0.6, Math.sin(t * 2.2 + s) * my * 0.38, 0);
    }
    case "patrol":
      return new THREE.Vector3(
        Math.sin(t * 0.35 + s) * mx * 0.62,
        Math.cos(t * 0.28 + s * 0.5) * my * 0.35,
        0
      );
    default:
      return new THREE.Vector3(Math.cos(t + s) * mx * 0.55, Math.sin(t + s) * my * 0.5, 0);
  }
}

function buildClosedPolyline(points) {
  if (!points?.length) return { segments: [], total: 0 };
  if (points.length === 1) return { segments: [], total: 0 };
  const segments = [];
  let total = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const len = a.distanceTo(b);
    if (len < 1e-5) continue;
    segments.push({ a, b, len });
    total += len;
  }
  return { segments, total };
}

function positionOnLoop(dist, segments, total) {
  if (!segments.length || total < 1e-6) return new THREE.Vector3();
  let d = ((dist % total) + total) % total;
  for (const seg of segments) {
    if (d <= seg.len + 1e-6) {
      const t = seg.len > 1e-6 ? d / seg.len : 0;
      return new THREE.Vector3().lerpVectors(seg.a, seg.b, t);
    }
    d -= seg.len;
  }
  return segments[0].a.clone();
}

function distPointToRect(px, py, r) {
  const x = Math.min(Math.max(px, r.left), r.right);
  const y = Math.min(Math.max(py, r.top), r.bottom);
  return Math.hypot(px - x, py - y);
}

function RailCollector({ railsRef }) {
  const { camera, gl, viewport } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const clampWorld = useCallback(
    (p) => {
      const w = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
      const margin = 0.32;
      p.x = THREE.MathUtils.clamp(p.x, -w.width / 2 + margin, w.width / 2 - margin);
      p.y = THREE.MathUtils.clamp(p.y, -w.height / 2 + margin, w.height / 2 - margin);
      p.z = 0;
      return p;
    },
    [camera, viewport]
  );

  const refresh = useCallback(() => {
    const rect = gl.domElement.getBoundingClientRect();
    const anchors = collectClientAnchors();
    const pts = [];
    for (const { cx, cy } of anchors) {
      const x = ((cx - rect.left) / rect.width) * 2 - 1;
      const y = -((cy - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        pts.push(clampWorld(hit.clone()));
      }
    }

    if (pts.length < 2) {
      const w = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
      const m = 0.9;
      pts.push(
        new THREE.Vector3(-w.width / 2 + m, w.height / 2 - m, 0),
        new THREE.Vector3(w.width / 2 - m, w.height / 2 - m, 0),
        new THREE.Vector3(w.width / 2 - m, -w.height / 2 + m, 0),
        new THREE.Vector3(-w.width / 2 + m, -w.height / 2 + m, 0)
      );
    }

    railsRef.current = { points: pts, version: Date.now() };
  }, [camera, gl, plane, raycaster, hit, clampWorld, viewport]);

  useEffect(() => {
    refresh();
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    window.addEventListener("scroll", refresh, true);
    const iv = setInterval(refresh, 550);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", refresh, true);
      clearInterval(iv);
    };
  }, [refresh]);

  return null;
}

function Pet3D({
  id,
  seed,
  pathKey,
  color,
  jointColor,
  dragRef,
  moodRef,
  proximityRef,
  railsRef,
  register,
}) {
  const group = useRef(null);
  const smooth = useRef(new THREE.Vector3(0, 0, 0));
  const roamT = useRef(seed * 4);
  const railDist = useRef(seed * 2.7 + id.charCodeAt(0) * 0.35);
  const railCache = useRef({ version: -1, segments: [], total: 0 });
  const [mood, setMood] = useState("idle");
  const lastMood = useRef("idle");

  useFrame((state, delta) => {
    const { camera, viewport } = state;
    const w = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
    const vw = w.width;
    const vh = w.height;

    const drag = dragRef.current;
    if (drag?.id === id && drag.world) {
      damp3(smooth.current, drag.world, 0.52, delta);
    } else {
      const rw = railsRef.current;
      const pts = rw?.points ?? [];
      if (pts.length >= 2) {
        if (railCache.current.version !== rw.version) {
          const { segments, total } = buildClosedPolyline(pts);
          railCache.current = { version: rw.version, segments, total };
        }
        const { segments, total } = railCache.current;
        if (segments.length > 0 && total > 1e-4) {
          railDist.current += delta * (0.36 + (seed % 9) * 0.018);
          const raw = positionOnLoop(railDist.current, segments, total);
          const hop = Math.sin((railDist.current / total) * Math.PI * 2 * 5.5) * 0.1;
          raw.y += hop;
          damp3(smooth.current, raw, 0.17, delta);
        } else {
          roamT.current += delta * 0.048;
          const tgt = pathTarget(roamT.current, seed, pathKey, vw, vh);
          damp3(smooth.current, tgt, 0.1, delta);
        }
      } else {
        roamT.current += delta * 0.048;
        const tgt = pathTarget(roamT.current, seed, pathKey, vw, vh);
        damp3(smooth.current, tgt, 0.1, delta);
      }
    }

    if (group.current) {
      group.current.position.copy(smooth.current);

      const m = moodRef.current[id] ?? "idle";
      if (m === "spin") {
        group.current.rotation.y += delta * 11;
      } else {
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, 0, 5, delta);
      }
    }

    register(id, group);

    const mr = moodRef.current[id] ?? "idle";
    if (mr !== lastMood.current) {
      lastMood.current = mr;
      setMood(mr);
    }
  });

  return (
    <group ref={group}>
      <ChibiSkeleton3D
        boneColor={color}
        jointColor={jointColor}
        proximityRef={proximityRef}
        pid={id}
      />
      {mood === "happy" && (
        <Html center position={[0, 0.52, 0]} distanceFactor={5} style={{ pointerEvents: "none" }}>
          <span style={{ fontSize: 14, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>💜</span>
        </Html>
      )}
    </group>
  );
}

function Scene({ pets, dragRef, moodRef, proximityRef, petGroupsRef, railsRef }) {
  const register = useCallback(
    (id, groupRef) => {
      petGroupsRef.current[id] = groupRef;
    },
    [petGroupsRef]
  );

  return (
    <>
      <ambientLight intensity={0.52} />
      <hemisphereLight args={["#eef2ff", "#0a0f1e", 0.55]} />
      <directionalLight position={[6, 10, 8]} intensity={1.15} />
      <directionalLight position={[-5, 4, -4]} intensity={0.38} color="#93c5fd" />

      <RailCollector railsRef={railsRef} />

      {pets.map((p) => (
        <Pet3D
          key={p.id}
          id={p.id}
          seed={p.seed}
          pathKey={p.pathKey}
          color={p.color}
          jointColor={p.jointColor}
          dragRef={dragRef}
          moodRef={moodRef}
          proximityRef={proximityRef}
          railsRef={railsRef}
          register={register}
        />
      ))}
    </>
  );
}

function ProximityLoop({ petGroupsRef, proximityRef }) {
  const { camera, gl, size } = useThree();
  const acc = useRef(0);
  const rectsRef = useRef([]);

  const refreshRects = useCallback(() => {
    try {
      const nodes = document.querySelectorAll(INTERACTIVE);
      rectsRef.current = Array.from(nodes).map((el) => el.getBoundingClientRect());
    } catch {
      rectsRef.current = [];
    }
  }, []);

  useEffect(() => {
    refreshRects();
    const ro = new ResizeObserver(() => refreshRects());
    ro.observe(document.body);
    const id = window.setInterval(refreshRects, 450);
    return () => {
      ro.disconnect();
      clearInterval(id);
    };
  }, [refreshRects]);

  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    acc.current += delta;
    if (acc.current < 0.07) return;
    acc.current = 0;

    const rect = gl.domElement.getBoundingClientRect();
    const pets = petGroupsRef.current;
    Object.keys(pets).forEach((pid) => {
      const gr = pets[pid]?.current;
      if (!gr) return;
      gr.getWorldPosition(v);
      v.project(camera);
      const sx = (v.x * 0.5 + 0.5) * size.width + rect.left;
      const sy = (-v.y * 0.5 + 0.5) * size.height + rect.top;

      let min = 140;
      for (let i = 0; i < rectsRef.current.length; i++) {
        const d = distPointToRect(sx, sy, rectsRef.current[i]);
        if (d < min) min = d;
      }
      proximityRef.current[pid] = min < 72 ? THREE.MathUtils.clamp(1 - min / 72, 0, 1) : 0;
    });
  });

  return null;
}

function PointerSystem({ petGroupsRef, dragRef, moodRef, lastTapRef }) {
  const { camera, gl, size, viewport } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const dragging = useRef(false);
  const dragId = useRef(null);
  const downPos = useRef({ x: 0, y: 0 });
  const moved = useRef(false);
  const happyTimerRef = useRef(null);

  const worldFromClient = useCallback(
    (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      raycaster.ray.intersectPlane(plane, hit);
      return hit.clone();
    },
    [camera, gl, plane, raycaster, hit]
  );

  const clampWorld = useCallback(
    (p) => {
      const w = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));
      const margin = 0.45;
      p.x = THREE.MathUtils.clamp(p.x, -w.width / 2 + margin, w.width / 2 - margin);
      p.y = THREE.MathUtils.clamp(p.y, -w.height / 2 + margin, w.height / 2 - margin);
      p.z = 0;
      return p;
    },
    [camera, viewport]
  );

  useEffect(() => {
    const onDown = (e) => {
      if (e.button !== 0) return;
      const el = e.target;
      if (el?.closest?.(INTERACTIVE)) return;

      const rect = gl.domElement.getBoundingClientRect();
      let best = null;
      let bestD = 1e9;
      Object.keys(petGroupsRef.current).forEach((pid) => {
        const gr = petGroupsRef.current[pid]?.current;
        if (!gr) return;
        const vec = new THREE.Vector3();
        gr.getWorldPosition(vec);
        vec.project(camera);
        const sx = (vec.x * 0.5 + 0.5) * size.width + rect.left;
        const sy = (-vec.y * 0.5 + 0.5) * size.height + rect.top;
        const d = Math.hypot(e.clientX - sx, e.clientY - sy);
        if (d < 40 && d < bestD) {
          bestD = d;
          best = pid;
        }
      });

      if (best != null) {
        e.preventDefault();
        dragging.current = true;
        dragId.current = best;
        moved.current = false;
        downPos.current = { x: e.clientX, y: e.clientY };
        const w = worldFromClient(e.clientX, e.clientY);
        clampWorld(w);
        dragRef.current = { id: best, world: w };
      }
    };

    const onMove = (e) => {
      if (!dragging.current || !dragId.current) return;
      if (Math.hypot(e.clientX - downPos.current.x, e.clientY - downPos.current.y) > 5) moved.current = true;
      const w = worldFromClient(e.clientX, e.clientY);
      clampWorld(w);
      dragRef.current = { id: dragId.current, world: w };
    };

    const onUp = () => {
      if (!dragging.current) return;
      const id = dragId.current;
      dragging.current = false;
      dragRef.current = { id: null, world: null };
      dragId.current = null;

      if (!moved.current && id) {
        const now = Date.now();
        if (lastTapRef.current && now - lastTapRef.current < 320) {
          if (happyTimerRef.current) {
            clearTimeout(happyTimerRef.current);
            happyTimerRef.current = null;
          }
          moodRef.current[id] = "spin";
          lastTapRef.current = 0;
          setTimeout(() => {
            moodRef.current[id] = "idle";
          }, 700);
        } else {
          lastTapRef.current = now;
          if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
          happyTimerRef.current = setTimeout(() => {
            happyTimerRef.current = null;
            moodRef.current[id] = "happy";
            setTimeout(() => {
              moodRef.current[id] = "idle";
            }, 580);
          }, 240);
        }
      }
    };

    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);

    return () => {
      if (happyTimerRef.current) clearTimeout(happyTimerRef.current);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
    };
  }, [camera, clampWorld, dragRef, gl, moodRef, petGroupsRef, size.height, size.width, worldFromClient, lastTapRef]);

  return null;
}

export default function Skeleton3DScene() {
  const pets = useMemo(
    () => [
      { id: "a", seed: 11, pathKey: "circle", color: "#ebe4d8", jointColor: "#ddd5c8" },
      { id: "b", seed: 27, pathKey: "figure8", color: "#d4d0f5", jointColor: "#c4bee8" },
      { id: "c", seed: 34, pathKey: "zigzag", color: "#c8e8fa", jointColor: "#b5dcf5" },
      { id: "d", seed: 42, pathKey: "oval", color: "#f5e6a8", jointColor: "#ebd78a" },
    ],
    []
  );

  const dragRef = useRef({ id: null, world: null });
  const moodRef = useRef({});
  const proximityRef = useRef({});
  const petGroupsRef = useRef({});
  const lastTapRef = useRef(0);
  const railsRef = useRef({ points: [], version: 0 });

  return (
    <Canvas
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={44} near={0.1} far={80} />
      <Scene
        pets={pets}
        dragRef={dragRef}
        moodRef={moodRef}
        proximityRef={proximityRef}
        petGroupsRef={petGroupsRef}
        railsRef={railsRef}
      />
      <ProximityLoop petGroupsRef={petGroupsRef} proximityRef={proximityRef} />
      <PointerSystem
        petGroupsRef={petGroupsRef}
        dragRef={dragRef}
        moodRef={moodRef}
        lastTapRef={lastTapRef}
      />
    </Canvas>
  );
}
