import { Suspense, lazy } from "react";

const Skeleton3DScene = lazy(() => import("./skeleton3d/Skeleton3DScene.jsx"));

/** Lớp xương 3D chibi — WebGL trong vùng trang; click xuyên vùng trống, kéo/tap xử lý toàn cục trong scene */
export default function MiniSkeletonPets() {
  return (
    <div
      className="mini-skel-layer"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 15,
      }}
    >
      <Suspense fallback={null}>
        <Skeleton3DScene />
      </Suspense>
    </div>
  );
}
