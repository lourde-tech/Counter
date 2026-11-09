"use client";

import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { ThemeMode } from "./use-shadcn-theme";

export type SceneContainerProps = {
  children: ReactNode;
  className?: string;
  theme?: ThemeMode;
  /**
   * "night" paints the dark backdrop the original demo uses.
   * "none" leaves the scene background unset on an alpha canvas, so whatever
   * sits behind the canvas (here, the rowhouse photo) shows through.
   */
  environment?: "none" | "night";
  camera: [number, number, number];
  fov: number;
};

export function SceneContainer({
  children,
  className,
  environment = "night",
  camera,
  fov,
}: SceneContainerProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: camera, fov }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      fallback={null}
    >
      {environment === "night" && <color attach="background" args={["#100c1b"]} />}
      {children}
    </Canvas>
  );
}
