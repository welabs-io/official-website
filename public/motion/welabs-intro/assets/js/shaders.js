// SHADERS DO FUNDO (grade de pontos, luz de foco em vermelhão, vinheta, dither fixo)
// Pure function of uniforms; no time-based noise, so the held final frame is pixel-stable.
const VS_QUAD = `#version 300 es
layout(location=0) in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }`;

const FS_FIELD = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uFade;
uniform vec2 uFocus; uniform float uFocusAmt; uniform float uSettle;
out vec4 o;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  // Top-left origin to match the 2D overlay coordinates
  vec2 f = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 base = vec3(13., 13., 16.) / 255.;
  vec3 deep = vec3(5., 5., 7.) / 255.;
  vec2 v = f / uRes - .5;
  vec3 c = mix(base, deep, clamp(dot(v, v) * 2.4, 0., 1.));
  float md = length(f - uFocus) / 560.;
  float lamp = exp(-md * md) * uFocusAmt;
  // Dot lattice every 48 px, brighter near the lamp, receding once the brand settles
  vec2 g = mod(f - uRes * .5, 48.) - 24.;
  float dotm = 1. - smoothstep(1.0, 2.0, length(g));
  float grid = dotm * (.07 + .16 * lamp) * uFade * (1. - .5 * uSettle);
  c = mix(c, vec3(.86, .86, .9), grid);
  c += vec3(1., .27, .17) * lamp * .085 * uFade;
  c += (hash(f) - .5) / 255.;
  o = vec4(c, 1.);
}`;
