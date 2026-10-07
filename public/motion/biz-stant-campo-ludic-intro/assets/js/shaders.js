// SHADERS DO FUNDO (papel de projeto: grade menor/maior, luz de foco, vinheta, dither)
// Pure function of uniforms: uT is the timeline time, never a clock.
const VS_QUAD = `#version 300 es
layout(location=0) in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }`;

const FS_BLUEPRINT = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uFade;
uniform vec2 uFocus; uniform float uFocusAmt; uniform float uSettle;
out vec4 o;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float gridLine(vec2 f, float step, float w){
  vec2 g = abs(fract(f / step + .5) - .5) * step;
  float d = min(g.x, g.y);
  return 1. - smoothstep(w * .5 - .5, w * .5 + .5, d);
}
void main(){
  // Top-left origin to match the 2D overlay coordinates
  vec2 f = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 c0 = f - uRes * .5;
  vec3 deep = vec3(4., 26., 52.) / 255.;
  vec3 base = vec3(10., 46., 88.) / 255.;
  vec2 v = f / uRes - .5;
  vec3 c = mix(base, deep, clamp(dot(v, v) * 2.1, 0., 1.));
  float md = length(f - uFocus) / 420.;
  float lamp = exp(-md * md) * uFocusAmt;
  // Grid is fully drawn after the fade and recedes slightly once the logo settles
  float minor = gridLine(c0, 40., 1.) * (.045 + .10 * lamp);
  float major = gridLine(c0, 200., 1.6) * (.10 + .20 * lamp);
  float g = (minor + major) * uFade * (1. - .45 * uSettle);
  vec3 ink = vec3(.78, .88, 1.);
  c = mix(c, ink, g);
  c += vec3(.10, .16, .26) * lamp * .55;
  c += (hash(f + fract(uT * 7.31)) - .5) / 255.;
  o = vec4(c, 1.);
}`;
