import { Color, DoubleSide, ShaderMaterial, UniformsLib, UniformsUtils } from "three";

// The vertex stage mirrors three's own shadow material, so the built-in shadow map keeps working.
const vertexShader = /* glsl */ `
  attribute vec2 aFlat;
  attribute vec4 aCrease;
  attribute vec4 aValley;
  attribute float aLayers;
  varying vec3 vNormal;
  varying vec2 vFlat;
  varying vec4 vCrease;
  varying vec4 vValley;
  varying float vLayers;
  #include <common>
  #include <shadowmap_pars_vertex>
  void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <begin_vertex>
    #include <project_vertex>
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    vNormal = transformedNormal;
    vFlat = aFlat;
    vCrease = aCrease;
    vValley = aValley;
    vLayers = aLayers;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uFace;
  uniform vec3 uReverse;
  uniform vec3 uPage;
  uniform float uFold;
  uniform float uMemory;
  uniform float uOcclusion;
  uniform float uPure;
  varying vec3 vNormal;
  varying vec2 vFlat;
  varying vec4 vCrease;
  varying vec4 vValley;
  varying float vLayers;
  #include <common>
  #include <bsdfs>
  #include <lights_pars_begin>
  #include <shadowmap_pars_fragment>
  #include <shadowmask_pars_fragment>

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    float facing = gl_FrontFacing ? 1.0 : -1.0;
    vec3 normal = normalize(vNormal) * facing;
    vec3 tone = gl_FrontFacing ? uFace : uReverse;

    #if NUM_DIR_LIGHTS > 0
      vec3 toLight = directionalLights[0].direction;
    #else
      vec3 toLight = normalize(vec3(-0.4, 0.5, 0.8));
    #endif
    float lit = dot(normal, toLight);
    float wrap = clamp((lit + 0.35) / 1.35, 0.0, 1.0);
    float shadow = getShadowMask();

    // Light arriving through the sheet from the far side, weaker with every stacked layer.
    float through = clamp(-lit, 0.0, 1.0) * 0.5 / (1.0 + vLayers * 1.5);

    // Seen from the back, mountains and valleys trade places.
    vec4 valley = gl_FrontFacing ? vValley : 1.0 - vValley;
    vec4 near = exp(-vCrease / 0.11);
    vec4 line = exp(-vCrease * vCrease / 0.0009);
    float pocket = dot(valley, near);
    float memory = dot(line, valley * 2.0 - 1.0);

    // Long fibers along the sheet plus a fine tooth.
    float fiber = noise(vFlat * vec2(110.0, 640.0)) * 0.45 + noise(vFlat * 1100.0) * 0.55 - 0.5;

    vec3 bounce = mix(vec3(1.0), uPage, 0.36);
    vec3 light = bounce * 0.64 + vec3(0.48) * wrap * mix(0.4, 1.0, shadow) + vec3(through) * shadow;
    light *= 1.0 - clamp(pocket * uFold * uOcclusion, 0.0, 0.32);
    light *= 1.0 - memory * uMemory * 0.035;
    light *= 1.0 + fiber * 0.035;

    vec3 color = mix(tone * light, tone, uPure);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

// Uniforms are written through methods on the instance, never by mutating memoized values.
export class PaperMaterial extends ShaderMaterial {
  private readonly face: Color;
  private readonly reverse: Color;
  private readonly page: Color;

  constructor() {
    super({ side: DoubleSide, vertexShader, fragmentShader, lights: true });
    this.shadowSide = DoubleSide;
    this.uniforms = UniformsUtils.merge([
      UniformsLib.lights,
      {
        uFace: { value: new Color() },
        uReverse: { value: new Color() },
        uPage: { value: new Color() },
        uFold: { value: 0 },
        uMemory: { value: 1 },
        uOcclusion: { value: 0.5 },
        uPure: { value: 0 },
      },
    ]);
    this.face = this.read("uFace");
    this.reverse = this.read("uReverse");
    this.page = this.read("uPage");
  }

  private read(name: string) {
    const value: unknown = this.uniforms[name]?.value;
    if (!(value instanceof Color)) throw new Error(`Paper uniform ${name} is not a color`);
    return value;
  }

  private write(name: string, value: number) {
    const uniform = this.uniforms[name];
    if (uniform) uniform.value = value;
  }

  setColors(face: string, reverse: string, page: Color) {
    this.face.set(face);
    this.reverse.set(reverse);
    this.page.copy(page);
  }

  /** `fold` is how closed the creases are (0-1); `memory` shows creases that were folded before. */
  setFold(fold: number, memory: number) {
    this.write("uFold", fold);
    this.write("uMemory", memory);
  }

  /** Without a shadow map the pockets of the valleys carry the depth on their own. */
  setOcclusion(strength: number) {
    this.write("uOcclusion", strength);
  }

  /** 1 shows the pure token color, so the sheet can take over from the preloader without a cut. */
  setPure(amount: number) {
    this.write("uPure", amount);
  }
}
