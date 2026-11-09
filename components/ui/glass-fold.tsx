"use client"

// From GradFlow, animated WebGL gradients for React: https://gradflow.meerbahadin.dev
//
// Counter changes to the supplied component, each marked "Counter:" below:
// - the draw loop pauses while the canvas is off screen or the tab is hidden;
// - if the shader fails to compile or link, the canvas is hidden, so the
//   parent's background shows instead of an opaque black box;
// - the latest props are stored in an effect rather than during render.

import { useEffect, useRef } from "react"

export interface GlassFoldProps {
  /** The body of each glass pane. */
  color1?: string
  /** The background. */
  color2?: string
  /** The lit edges. */
  color3?: string
  /** Animation speed. 0 freezes it. */
  speed?: number
  /** How tightly the folds are packed. Higher is more, smaller folds. */
  scale?: number
  /** Film grain, 0 to 0.5. */
  noise?: number
  className?: string
}

const VERTEX = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT = `
  precision highp float;

  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_scale;
  uniform float u_noise;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  float grain(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // centered coordinates, y in [-0.5, 0.5], x stretched by the aspect ratio
  vec2 centered(vec2 uv) {
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / max(u_resolution.y, 1.0);
    return p;
  }

  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  // panes of glass folded over each other. Each pane has one creased edge
  // that catches the light and thins out to nothing behind it; panes screen
  // over one another, so overlaps get brighter instead of darker.
  vec3 shade(vec2 uv, float time) {
    vec2 q = rot(0.6) * centered(uv) * 2.0 * u_scale;
    float t = time * 0.6;
    float pixel = 2.0 * u_scale / max(u_resolution.y, 1.0);

    vec3 color = mix(u_color2, u_color2 * 0.45, clamp(length(centered(uv)) * 1.3, 0.0, 1.0));

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float bend = mod(fi, 2.0) * 2.0 - 1.0;

      float crease = (fi - 2.5) * 0.4
                   + 0.26 * sin(q.x * (1.05 + 0.12 * fi) + fi * 1.9 + t * (0.25 + 0.05 * fi))
                   + 0.1 * bend * q.x * q.x;
      float s = q.y - crease;
      float pane = smoothstep(-pixel, pixel, s);
      float back = max(s, 0.0);

      // thick near the crease, clear further in
      float body = exp(-back * 1.7);
      float fresnel = exp(-back * 8.0);
      // the lit edge, and a fainter line just inside it for the glass's thickness
      float rim = exp(-back * 80.0);
      float inner = exp(-pow((back - 0.045) / 0.014, 2.0));
      float bloom = exp(-abs(s) * 20.0);

      vec3 tint = mix(u_color1, u_color3, clamp(fresnel * 0.6 + 0.08 + 0.14 * sin(fi * 2.1 + q.x * 0.8 + t * 0.2), 0.0, 1.0));
      vec3 light = tint * pane * (body * 0.42 + fresnel * 0.4)
                 + u_color3 * (pane * (rim * 0.6 + inner * 0.12) + bloom * 0.1);

      // screen blend
      color += light * (1.0 - color);
    }

    return clamp(color, 0.0, 1.0);
  }

  void main() {
    vec3 color = shade(vUv, u_time);
    if (u_noise > 0.001) {
      float g = grain(vUv * 200.0 + u_time * 0.1);
      color *= 1.0 - u_noise * 0.4 + u_noise * g * 0.4;
    }
    gl_FragColor = vec4(color, 1.0);
  }
`

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(full, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

export function GlassFold({
  color1 = "#1e3cc8",
  color2 = "#06081e",
  color3 = "#96d7ff",
  speed = 0.5,
  scale = 1,
  noise = 0.12,
  className,
}: GlassFoldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // the draw loop reads the latest props from here, so changing one never
  // rebuilds the WebGL program
  const props = useRef({ color1, color2, color3, speed, scale, noise })
  // Counter: refresh the stored props after each render instead of during it.
  useEffect(() => {
    props.current = { color1, color2, color3, speed, scale, noise }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
    if (!gl) return

    const program = gl.createProgram()!
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    // Counter: the shaders are linked into the program and no longer needed on their own.
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    // Counter: a GPU that can't build the shader hides the canvas, rather than showing an opaque black box.
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      canvas.style.visibility = "hidden"
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    const position = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const u = {
      time: uniform("u_time"),
      color1: uniform("u_color1"),
      color2: uniform("u_color2"),
      color3: uniform("u_color3"),
      scale: uniform("u_scale"),
      noise: uniform("u_noise"),
      resolution: uniform("u_resolution"),
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
    }

    let elapsed = 0
    let last: number | null = null
    let frame = 0

    const draw = (now: number) => {
      const p = props.current
      // accumulate speed over time, so changing it never makes the pattern jump
      if (last !== null) elapsed += Math.min((now - last) / 1000, 0.1) * p.speed
      last = now

      resize()
      gl.uniform1f(u.time, elapsed)
      gl.uniform3fv(u.color1, hexToVec3(p.color1))
      gl.uniform3fv(u.color2, hexToVec3(p.color2))
      gl.uniform3fv(u.color3, hexToVec3(p.color3))
      gl.uniform1f(u.scale, p.scale)
      gl.uniform1f(u.noise, p.noise)
      gl.uniform2f(u.resolution, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Counter: run the loop only while the canvas is on screen and the tab is visible.
    let onScreen = true
    const running = () => !still && onScreen && document.visibilityState === "visible"
    const loop = (now: number) => {
      frame = 0
      draw(now)
      if (running()) frame = requestAnimationFrame(loop)
    }
    const resume = () => {
      if (frame || !running()) return
      last = null // pick up where it paused, without a jump
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      resume()
    })
    visibility.observe(canvas)
    document.addEventListener("visibilitychange", resume)

    // with motion off there is no loop, so repaint the still frame on resize
    const observer = new ResizeObserver(() => {
      if (still) draw(performance.now())
    })
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      document.removeEventListener("visibilitychange", resume)
      observer.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}
