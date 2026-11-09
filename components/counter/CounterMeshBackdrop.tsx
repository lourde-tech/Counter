"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionAllowed, useWebGL } from "./decorative";

/*
 * A soft, slowly moving white-and-violet mesh behind the landing page
 * (adapted from the ShaderShowcase MeshGradient backdrop). Decorative only:
 * it sits below every element, ignores pointer events, and fades out before
 * the footer. Without motion, without WebGL2, or if the shader fails to
 * start, the page stays plain white.
 *
 * It uses the core @paper-design/shaders ShaderMount directly rather than the
 * React wrapper: the wrapper starts the shader inside an async function, so a
 * WebGL failure becomes an uncaught error that no error boundary can catch.
 * Here the start is wrapped in try/catch and a half-made canvas is removed.
 */

/** Counter tokens: paper, lavender, violet. The wrapper's opacity keeps the violet soft. */
const MESH_COLORS = ["#ffffff", "#f1ebff", "#6638d8", "#ffffff"];
const SPEED = 0.16;

function MeshCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let mount: { dispose(): void } | null = null;
    let cancelled = false;

    import("@paper-design/shaders")
      .then(({ ShaderMount, meshGradientFragmentShader, getShaderColorFromString, ShaderFitOptions, defaultObjectSizing: size }) => {
        if (cancelled) return;
        try {
          mount = new ShaderMount(
            el,
            meshGradientFragmentShader,
            {
              u_colors: MESH_COLORS.map(getShaderColorFromString),
              u_colorsCount: MESH_COLORS.length,
              u_distortion: 0.8,
              u_swirl: 0.1,
              u_grainMixer: 0,
              u_grainOverlay: 0,
              u_fit: ShaderFitOptions[size.fit],
              u_rotation: size.rotation,
              u_scale: size.scale,
              u_offsetX: size.offsetX,
              u_offsetY: size.offsetY,
              u_originX: size.originX,
              u_originY: size.originY,
              u_worldWidth: size.worldWidth,
              u_worldHeight: size.worldHeight,
            },
            undefined,
            SPEED,
            0,
            1, // minPixelRatio: a soft gradient doesn't need retina resolution
            1920 * 1080, // maxPixelCount
          );
        } catch {
          el.querySelectorAll("canvas").forEach((c) => c.remove());
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      mount?.dispose();
    };
  }, []);

  if (failed) return null;
  return <div ref={ref} className="h-full w-full" />;
}

export default function CounterMeshBackdrop() {
  const motion = useMotionAllowed();
  const webgl2 = useWebGL("webgl2");
  if (!motion || !webgl2) return null;

  return (
    <div
      aria-hidden="true"
      data-counter-mesh
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-35 [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_75%)]"
    >
      <MeshCanvas />
    </div>
  );
}
