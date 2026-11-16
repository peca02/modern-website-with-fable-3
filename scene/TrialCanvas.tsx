"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { DoubleSide, ShaderMaterial } from "three";

class TrialMaterial extends ShaderMaterial {
  constructor() {
    super({
      side: DoubleSide,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float tone = 0.9 + 0.1 * sin(uTime + vUv.x * 6.2831);
          gl_FragColor = vec4(vec3(0.965, 0.945, 0.894) * tone, 1.0);
        }`,
    });
  }

  setTime(time: number) {
    const uniform = this.uniforms.uTime;
    if (uniform) uniform.value = time;
  }
}

function Sheet() {
  const [material] = useState(() => new TrialMaterial());
  const frames = useRef(0);

  useFrame(({ clock }) => {
    material.setTime(clock.elapsedTime);
    frames.current += 1;
    if (frames.current === 2) document.documentElement.dataset.scene = "ready";
  });

  return (
    <mesh rotation={[-0.6, 0.4, 0]} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export function TrialCanvas() {
  return (
    <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 5], fov: 35 }}>
      <Sheet />
    </Canvas>
  );
}
