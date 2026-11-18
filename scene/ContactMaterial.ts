import { Color, ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform float uOpacity;
  uniform float uSoft;
  varying vec2 vUv;
  void main() {
    vec2 edge = 1.0 - smoothstep(1.0 - uSoft, 1.0, abs(vUv));
    gl_FragColor = vec4(uInk, uOpacity * edge.x * edge.y);
    #include <colorspace_fragment>
  }
`;

// The low tiers' stand-in for the shadow map: one soft patch of ink on the page under the sheet.
export class ContactMaterial extends ShaderMaterial {
  readonly ink = new Color();

  constructor() {
    super({ vertexShader, fragmentShader, transparent: true, depthWrite: false });
    this.uniforms = { uInk: { value: this.ink }, uOpacity: { value: 0.3 }, uSoft: { value: 0.5 } };
  }

  setSoftness(soft: number, opacity: number) {
    const { uSoft, uOpacity } = this.uniforms;
    if (uSoft) uSoft.value = soft;
    if (uOpacity) uOpacity.value = opacity;
  }
}
