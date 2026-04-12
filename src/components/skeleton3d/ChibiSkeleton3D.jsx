import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Chibi 3D skeleton — đầu to, khớp tròn, nhựa ngà; proximity + tốc độ cập nhật trong useFrame */
export default function ChibiSkeleton3D({ boneColor = "#ebe4d8", jointColor = "#ddd5c8", proximityRef, pid }) {
  const root = useRef(null);
  const armL = useRef(null);
  const armR = useRef(null);
  const legL = useRef(null);
  const legR = useRef(null);
  const body = useRef(null);
  const prevWorld = useRef(new THREE.Vector3(0, 0, 0));
  const hasPrev = useRef(false);

  const gradMap = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 1;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 4, 0);
    g.addColorStop(0, "#444");
    g.addColorStop(1, "#fff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 1);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, []);

  const matProps = useMemo(
    () => ({
      color: boneColor,
      gradientMap: gradMap || undefined,
      shininess: 0,
    }),
    [boneColor, gradMap]
  );

  const jointMat = useMemo(
    () => ({
      color: jointColor,
      gradientMap: gradMap || undefined,
    }),
    [jointColor, gradMap]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    let excited = 0;
    if (proximityRef?.current && pid != null) {
      excited = proximityRef.current[pid] ?? 0;
    }

    let walk = 0;
    if (root.current) {
      const p = new THREE.Vector3();
      root.current.getWorldPosition(p);
      if (hasPrev.current) {
        walk = THREE.MathUtils.clamp((p.distanceTo(prevWorld.current) / Math.max(delta, 1e-4)) * 0.28, 0, 1);
      }
      prevWorld.current.copy(p);
      hasPrev.current = true;
    }

    const w = walk * (1 + excited * 0.4);
    const swing = Math.sin(t * 7) * 0.45 * w;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.85;
    if (armR.current) {
      armR.current.rotation.x = -swing * 0.85 - excited * 1.05;
      armR.current.rotation.z = excited * 0.45;
    }
    if (body.current) body.current.rotation.y = Math.sin(t * 3) * 0.05 * excited;
    if (root.current) {
      root.current.position.y = Math.sin(t * 9) * 0.02 * w + excited * 0.045;
    }
  });

  return (
    <group ref={root} scale={0.12}>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.48, 28, 28]} />
        <meshToonMaterial {...matProps} />
      </mesh>
      <mesh position={[-0.14, 0.55, 0.4]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#0c0c0c" />
      </mesh>
      <mesh position={[0.14, 0.55, 0.4]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#0c0c0c" />
      </mesh>
      <mesh position={[0, 0.44, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.1, 6]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>

      <group ref={body} position={[0, 0.08, 0]}>
        <mesh position={[0, -0.08, 0]}>
          <capsuleGeometry args={[0.22, 0.28, 10, 20]} />
          <meshToonMaterial {...matProps} />
        </mesh>
        {[-0.12, 0, 0.12].map((z, i) => (
          <mesh key={i} position={[0, -0.02 + i * 0.06, z]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.32, 0.04, 0.04]} />
            <meshToonMaterial {...matProps} />
          </mesh>
        ))}

        <mesh position={[-0.32, 0.02, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshToonMaterial {...jointMat} />
        </mesh>
        <mesh position={[0.32, 0.02, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshToonMaterial {...jointMat} />
        </mesh>

        <group ref={armL} position={[-0.32, 0.02, 0]} rotation={[0, 0, 0.15]}>
          <mesh position={[-0.22, -0.12, 0]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.06, 0.32, 8, 12]} />
            <meshToonMaterial {...matProps} />
          </mesh>
          <mesh position={[-0.42, -0.28, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshToonMaterial {...matProps} />
          </mesh>
        </group>

        <group ref={armR} position={[0.32, 0.02, 0]} rotation={[0, 0, -0.15]}>
          <mesh position={[0.22, -0.12, 0]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.06, 0.32, 8, 12]} />
            <meshToonMaterial {...matProps} />
          </mesh>
          <mesh position={[0.42, -0.28, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshToonMaterial {...matProps} />
          </mesh>
        </group>

        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshToonMaterial {...jointMat} />
        </mesh>

        <mesh position={[-0.14, -0.55, 0]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshToonMaterial {...jointMat} />
        </mesh>
        <mesh position={[0.14, -0.55, 0]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshToonMaterial {...jointMat} />
        </mesh>

        <group ref={legL} position={[-0.14, -0.55, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 8, 14]} />
            <meshToonMaterial {...matProps} />
          </mesh>
          <mesh position={[0, -0.58, 0.06]}>
            <boxGeometry args={[0.14, 0.08, 0.22]} />
            <meshToonMaterial {...matProps} />
          </mesh>
        </group>
        <group ref={legR} position={[0.14, -0.55, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 8, 14]} />
            <meshToonMaterial {...matProps} />
          </mesh>
          <mesh position={[0, -0.58, 0.06]}>
            <boxGeometry args={[0.14, 0.08, 0.22]} />
            <meshToonMaterial {...matProps} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
