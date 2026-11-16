import { Color, DoubleSide, ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uFace;
  uniform vec3 uReverse;
  varying vec3 vNormal;
  void main() {
    vec3 normal = gl_FrontFacing ? vNormal : -vNormal;
    vec3 light = normalize(vec3(0.4, 0.8, 0.6));
    float wrap = dot(normal, light) * 0.4 + 0.6;
    vec3 tone = gl_FrontFacing ? uFace : uReverse;
    gl_FragColor = vec4(tone * mix(0.72, 1.0, wrap), 1.0);
    #include <colorspace_fragment>
  }
`;

// Uniforms are written through methods on the instance, never by mutating memoized values.
export class PaperMaterial extends ShaderMaterial {
  private readonly face = new Color();
  private readonly reverse = new Color();

  constructor() {
    super({ side: DoubleSide, vertexShader, fragmentShader });
    this.uniforms = { uFace: { value: this.face }, uReverse: { value: this.reverse } };
  }

  setColors(face: string, reverse: string) {
    this.face.set(face);
    this.reverse.set(reverse);
  }
}
