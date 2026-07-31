import * as THREE from 'three';
import { VOID } from '../art/palette';

// The pixel pipeline (spec §4.2). Three passes:
//   1. scene → low-res colour target (+ depth texture)
//   2. scene (MeshNormalMaterial) → low-res normal target
//   3. Sobel over normal+depth → colour-preserving outline, integer upscale
//
// renderer.setPixelRatio(1) always — we control pixels manually.

const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D colorTex;
  uniform sampler2D normalTex;
  uniform sampler2D depthTex;
  uniform vec2  texel;
  uniform float depthThreshold;
  uniform float normalThreshold;
  uniform float outlineDark;
  uniform float vignette;
  varying vec2 vUv;

  float sobelDepth(vec2 uv) {
    float s = 0.0;
    float gx = 0.0, gy = 0.0;
    float k[9];
    // sample depths
    float d00 = texture2D(depthTex, uv + texel * vec2(-1.0,-1.0)).r;
    float d10 = texture2D(depthTex, uv + texel * vec2( 0.0,-1.0)).r;
    float d20 = texture2D(depthTex, uv + texel * vec2( 1.0,-1.0)).r;
    float d01 = texture2D(depthTex, uv + texel * vec2(-1.0, 0.0)).r;
    float d21 = texture2D(depthTex, uv + texel * vec2( 1.0, 0.0)).r;
    float d02 = texture2D(depthTex, uv + texel * vec2(-1.0, 1.0)).r;
    float d12 = texture2D(depthTex, uv + texel * vec2( 0.0, 1.0)).r;
    float d22 = texture2D(depthTex, uv + texel * vec2( 1.0, 1.0)).r;
    gx = (d20 + 2.0*d21 + d22) - (d00 + 2.0*d01 + d02);
    gy = (d02 + 2.0*d12 + d22) - (d00 + 2.0*d10 + d20);
    s = length(vec2(gx, gy));
    return s;
  }

  float sobelNormal(vec2 uv) {
    vec3 n00 = texture2D(normalTex, uv + texel * vec2(-1.0,-1.0)).rgb;
    vec3 n10 = texture2D(normalTex, uv + texel * vec2( 0.0,-1.0)).rgb;
    vec3 n20 = texture2D(normalTex, uv + texel * vec2( 1.0,-1.0)).rgb;
    vec3 n01 = texture2D(normalTex, uv + texel * vec2(-1.0, 0.0)).rgb;
    vec3 n21 = texture2D(normalTex, uv + texel * vec2( 1.0, 0.0)).rgb;
    vec3 n02 = texture2D(normalTex, uv + texel * vec2(-1.0, 1.0)).rgb;
    vec3 n12 = texture2D(normalTex, uv + texel * vec2( 0.0, 1.0)).rgb;
    vec3 n22 = texture2D(normalTex, uv + texel * vec2( 1.0, 1.0)).rgb;
    vec3 gx = (n20 + 2.0*n21 + n22) - (n00 + 2.0*n01 + n02);
    vec3 gy = (n02 + 2.0*n12 + n22) - (n00 + 2.0*n10 + n20);
    return length(gx) + length(gy);
  }

  void main() {
    vec3 col = texture2D(colorTex, vUv).rgb;
    float dEdge = sobelDepth(vUv)  > depthThreshold  ? 1.0 : 0.0;
    float nEdge = sobelNormal(vUv) > normalThreshold ? 1.0 : 0.0;
    float edge = max(dEdge, nEdge);
    vec3 outlined = mix(col, col * outlineDark, edge);
    // radial void vignette
    vec2 d = vUv - 0.5;
    float v = 1.0 - vignette * dot(d, d) * 2.4;
    gl_FragColor = vec4(outlined * v, 1.0);
  }
`;

const COMPOSITE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export class Renderer {
  readonly gl: THREE.WebGLRenderer;
  private colorTarget!: THREE.WebGLRenderTarget;
  private normalTarget!: THREE.WebGLRenderTarget;
  private normalMaterial = new THREE.MeshNormalMaterial();
  private composite: THREE.ShaderMaterial;
  private quadScene = new THREE.Scene();
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private cssW = 1;
  private cssH = 1;
  private pixel = 4;
  private lowW = 1;
  private lowH = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.gl.setPixelRatio(1);
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = THREE.BasicShadowMap; // hard shadows pixelate with everything
    this.gl.setClearColor(new THREE.Color(VOID), 1);
    this.gl.outputColorSpace = THREE.SRGBColorSpace;

    this.composite = new THREE.ShaderMaterial({
      uniforms: {
        colorTex: { value: null },
        normalTex: { value: null },
        depthTex: { value: null },
        texel: { value: new THREE.Vector2(1, 1) },
        depthThreshold: { value: 0.02 },
        normalThreshold: { value: 0.35 },
        outlineDark: { value: 0.52 },
        vignette: { value: 0.1 },
      },
      vertexShader: COMPOSITE_VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.composite);
    quad.frustumCulled = false;
    this.quadScene.add(quad);

    this.buildTargets();
  }

  setSize(cssW: number, cssH: number, pixel: number): void {
    this.cssW = Math.max(1, Math.floor(cssW));
    this.cssH = Math.max(1, Math.floor(cssH));
    this.pixel = pixel;
    this.gl.setSize(this.cssW, this.cssH, false);
    this.buildTargets();
  }

  setPixelSize(pixel: number): void {
    if (pixel === this.pixel) return;
    this.pixel = pixel;
    this.buildTargets();
  }

  private buildTargets(): void {
    this.lowW = Math.max(1, Math.ceil(this.cssW / this.pixel));
    this.lowH = Math.max(1, Math.ceil(this.cssH / this.pixel));

    this.colorTarget?.dispose();
    this.normalTarget?.dispose();

    const depthTexture = new THREE.DepthTexture(this.lowW, this.lowH);
    depthTexture.type = THREE.UnsignedIntType;
    depthTexture.minFilter = THREE.NearestFilter;
    depthTexture.magFilter = THREE.NearestFilter;

    this.colorTarget = new THREE.WebGLRenderTarget(this.lowW, this.lowH, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
      depthBuffer: true,
      depthTexture,
      colorSpace: THREE.SRGBColorSpace,
    });
    this.normalTarget = new THREE.WebGLRenderTarget(this.lowW, this.lowH, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
      depthBuffer: true,
    });

    this.composite.uniforms.texel.value.set(1 / this.lowW, 1 / this.lowH);
  }

  setUniform(name: 'depthThreshold' | 'normalThreshold' | 'outlineDark' | 'vignette', v: number): void {
    this.composite.uniforms[name].value = v;
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    // Pass 1 — colour + depth
    this.gl.setRenderTarget(this.colorTarget);
    this.gl.setClearColor(new THREE.Color(VOID), 1);
    this.gl.clear(true, true, true);
    this.gl.render(scene, camera);

    // Pass 2 — normals
    const prevBg = scene.background;
    scene.background = null;
    scene.overrideMaterial = this.normalMaterial;
    this.gl.setRenderTarget(this.normalTarget);
    this.gl.setClearColor(new THREE.Color(0x7f7fff), 1);
    this.gl.clear(true, true, true);
    this.gl.render(scene, camera);
    scene.overrideMaterial = null;
    scene.background = prevBg;

    // Pass 3 — composite + integer upscale to canvas
    this.composite.uniforms.colorTex.value = this.colorTarget.texture;
    this.composite.uniforms.normalTex.value = this.normalTarget.texture;
    this.composite.uniforms.depthTex.value = this.colorTarget.depthTexture;
    this.gl.setRenderTarget(null);
    this.gl.render(this.quadScene, this.quadCam);
  }

  dispose(): void {
    this.colorTarget?.dispose();
    this.normalTarget?.dispose();
    this.normalMaterial.dispose();
    this.composite.dispose();
    (this.quadScene.children[0] as THREE.Mesh).geometry.dispose();
    this.gl.dispose();
  }
}
