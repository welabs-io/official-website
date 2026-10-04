// Shaders copied verbatim from tabela-v3 brand-intro/shaders.ts (GLSL unchanged)

const VS_QUAD = `#version 300 es
layout(location=0) in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }`

const COMMON = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec4 uRect; uniform float uBgT; uniform float uLod0;
uniform vec2 uMouse; uniform vec3 uHero; uniform float uDpr;
out vec4 o;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 luv(vec2 f){ return (f - uRect.xy) / uRect.zw; }
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float lineA(float d, float w){ return 1. - smoothstep(w * .5 - .6, w * .5 + .6, d); }
void lay(inout vec4 dst, vec3 c, float a){ a = clamp(a, 0., 1.); dst = vec4(c * a, a) + dst * (1. - a); }
vec3 bgColor(vec2 f, float time){
  vec3 c = uHero;
  float s = uRes.y / 9.; vec2 g = f / s; vec2 gi = floor(g), gf = fract(g);
  float dl = min(min(gf.x, 1. - gf.x), min(gf.y, 1. - gf.y)) * s;
  float md = length(f - uMouse) / (s * 2.6);
  float la = clamp(1.2 - dl, 0., 1.) * (.07 + .22 * exp(-md * md));
  float pulse = pow(max(sin(time * .7 + hash(gi) * 6.2832), 0.), 24.) * .07;
  c = mix(c, vec3(1.), la + pulse + .05 * exp(-md * md));
  vec2 v = f / uRes - .5; c *= 1. - .22 * dot(v, v) * 2.;
  return c;
}
`

const FS_BG = COMMON + `
void main(){ vec2 f = gl_FragCoord.xy; o = vec4(bgColor(f, uBgT) + (hash(f + uBgT) - .5) / 255., 1.); }`

const FS_CRANE = COMMON + `
uniform vec4 uCrane;
float boxA(vec2 p, vec2 c, vec2 h){ vec2 q = abs(p - c) - h; return 1. - smoothstep(-.6, .6, max(q.x, q.y)); }
void main(){
  vec2 f = gl_FragCoord.xy; float lw = uDpr;
  vec2 p = f - vec2(uCrane.z, 0.);
  float W = uRes.x, Hh = uRes.y;
  float mx = W * .87, mw = 16. * lw, jy = Hh * .86, jh = 13. * lw, jl = W * .05, jr = mx + W * .1;
  float a = 0.;
  a = max(a, lineA(abs(p.x - (mx - mw * .5)), 2. * lw) * step(p.y, jy));
  a = max(a, lineA(abs(p.x - (mx + mw * .5)), 2. * lw) * step(p.y, jy));
  if (abs(p.x - mx) < mw * .5 + 2. && p.y < jy) {
    float cy = floor(p.y / mw), fy = p.y - cy * mw, lx = p.x - (mx - mw * .5);
    bool ev = mod(cy, 2.) < 1.;
    a = max(a, lineA(sdSeg(vec2(lx, fy), ev ? vec2(0.) : vec2(mw, 0.), ev ? vec2(mw) : vec2(0., mw)), 1.2 * lw));
  }
  float onJ = step(jl, p.x) * step(p.x, jr);
  a = max(a, lineA(abs(p.y - jy), 2. * lw) * onJ);
  a = max(a, lineA(abs(p.y - (jy - jh)), 2. * lw) * step(jl, p.x) * step(p.x, mx + mw * .5));
  if (p.x > jl && p.x < mx && p.y < jy + 2. && p.y > jy - jh - 2.) {
    float cx = floor((p.x - jl) / jh), fx = (p.x - jl) - cx * jh, ly = p.y - (jy - jh);
    bool ev = mod(cx, 2.) < 1.;
    a = max(a, lineA(sdSeg(vec2(fx, ly), ev ? vec2(0.) : vec2(0., jh), ev ? vec2(jh) : vec2(jh, 0.)), 1.2 * lw));
  }
  a = max(a, lineA(sdSeg(p, vec2(jl, jy), vec2(jl, jy - jh)), 2. * lw));
  vec2 peak = vec2(mx, jy + Hh * .09);
  a = max(a, lineA(sdSeg(p, vec2(mx - mw * .5, jy), peak), 2. * lw));
  a = max(a, lineA(sdSeg(p, vec2(mx + mw * .5, jy), peak), 2. * lw));
  a = max(a, lineA(sdSeg(p, peak, vec2(jl + (mx - jl) * .4, jy)), 1. * lw) * .8);
  a = max(a, lineA(sdSeg(p, peak, vec2(jr, jy)), 1. * lw) * .8);
  a = max(a, boxA(p, vec2(jr - W * .025, jy - 12. * lw), vec2(W * .02, 11. * lw)) * .95);
  a = max(a, boxA(p, vec2(mx - mw * .5 - 11. * lw, jy - jh - 10. * lw), vec2(10. * lw, 9. * lw)) * .9);
  float tx = uCrane.x - uCrane.z, hy = uCrane.y;
  a = max(a, boxA(p, vec2(tx, jy - jh - 3. * lw), vec2(9. * lw, 3.5 * lw)));
  a = max(a, lineA(sdSeg(p, vec2(tx - 2.5 * lw, jy - jh - 6. * lw), vec2(tx - 2.5 * lw, hy + 16. * lw)), 1.1 * lw));
  a = max(a, lineA(sdSeg(p, vec2(tx + 2.5 * lw, jy - jh - 6. * lw), vec2(tx + 2.5 * lw, hy + 16. * lw)), 1.1 * lw));
  a = max(a, boxA(p, vec2(tx, hy + 13. * lw), vec2(6. * lw, 4. * lw)));
  a = max(a, lineA(abs(length(p - vec2(tx, hy + 4. * lw)) - 4. * lw), 2. * lw) * step(p.y, hy + 6. * lw));
  a = max(a, lineA(sdSeg(p, vec2(tx, hy + 9. * lw), vec2(tx, hy + 7. * lw)), 2. * lw));
  a *= uCrane.w * .95;
  o = vec4(vec3(.99, .79, .22) * a, a);
}`

const FS_PIECE = COMMON + `
uniform sampler2D uPart; uniform vec4 uXf; uniform vec2 uPivot;
void main(){
  vec2 f = gl_FragCoord.xy;
  vec2 q = f - (uPivot + uXf.xy);
  float c = cos(-uXf.z), s = sin(-uXf.z);
  q = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + uPivot;
  vec2 uv = luv(q); vec2 m = step(vec2(0), uv) * step(uv, vec2(1));
  o = textureLod(uPart, uv, uLod0) * m.x * m.y * uXf.w;
}`

const FS_DRILL = COMMON + `
uniform vec4 uDot; uniform vec4 uDrill; uniform vec4 uScrew; uniform vec4 uFx;
float fillA(float d, float px){ return 1. - smoothstep(-px, px, d); }
void main(){
  vec2 f = gl_FragCoord.xy; float lw = uDpr;
  vec4 col = vec4(0.);
  vec2 P = uDot.xy; float R = uDot.z;
  if (uFx.x >= 0.) {
    for (int i = 0; i < 14; i++) {
      float fi = float(i), a = hash(vec2(fi, 3.)) * 6.2832, sp = (.6 + hash(vec2(fi, 7.))) * R * 3.4;
      float age = uFx.x - hash(vec2(fi, 11.)) * .3;
      if (age < 0. || age > .45) continue;
      vec2 pos = P + vec2(cos(a), sin(a)) * (R * 1.1 + sp * age / .45) + vec2(0., -age * age * 60. * lw);
      float s = (1. + hash(vec2(fi, 5.)) * 1.6) * lw;
      lay(col, vec3(.93, .9, .85), (1. - smoothstep(s - .7, s + .7, length(f - pos))) * (1. - age / .45) * .85);
    }
  }
  if (uFx.y >= 0. && uFx.y < .45) { float k = uFx.y / .45; lay(col, vec3(1.), lineA(abs(length(f - P) - R * (1.2 + 2.6 * k)), 2. * lw) * (1. - k) * .75); }
  if (uScrew.w > 0.) {
    float Rs = R * uScrew.x;
    vec2 q = f - P;
    float head = 1. - smoothstep(Rs - .8, Rs + .8, length(q));
    vec2 qr = rot(uScrew.y) * q;
    float cr = fillA(min(sdBox(qr, vec2(Rs * .64, Rs * .13), 0.), sdBox(qr, vec2(Rs * .13, Rs * .64), 0.)), .7) * uScrew.z;
    float rim = smoothstep(Rs * .72, Rs, length(q));
    // Head keeps the dot's real color from the start; only the Phillips slot fades after seating
    vec3 hc = vec3(1.);
    hc = mix(hc, uHero * .4, cr);
    lay(col, hc, head * uScrew.w);
  }
  if (uDrill.w > 0.) {
    float u = uRect.w * .22 * uFx.z;
    vec2 p = rot(uDrill.z) * (f - uDrill.xy) / u;
    float px = 1.1 / u;
    vec3 yel = vec3(.99, .76, .16), gph = vec3(.15, .16, .19), stl = vec3(.8, .82, .86);
    float bit = sdBox(p - vec2(0., .95), vec2(.085, .95), .04);
    float chuck = sdBox(p - vec2(0., 2.3), vec2(.36, .5), .1);
    float collar = sdBox(p - vec2(0., 2.9), vec2(.46, .14), .05);
    float body = sdBox(p - vec2(0., 4.1), vec2(.64, 1.1), .32);
    float cap = sdBox(p - vec2(0., 5.3), vec2(.5, .22), .14);
    float handle = sdBox(rot(-.2) * (p - vec2(1.3, 3.85)), vec2(.95, .36), .18);
    float batt = sdBox(p - vec2(2.35, 3.3), vec2(.52, .8), .14);
    float band = sdBox(p - vec2(2.35, 2.72), vec2(.52, .2), .08);
    float trig = sdBox(p - vec2(.78, 3.32), vec2(.14, .22), .06);
    vec4 dr = vec4(0.);
    float all_ = min(min(min(bit, chuck), min(collar, body)), min(min(cap, handle), batt));
    lay(dr, vec3(.05, .05, .08), fillA(all_ - 1.6 * px, px) * .55);
    lay(dr, yel, fillA(batt, px));
    lay(dr, gph, fillA(band, px));
    lay(dr, gph, fillA(handle, px));
    lay(dr, gph, fillA(trig, px));
    lay(dr, yel, fillA(body, px));
    lay(dr, vec3(1., .92, .62), fillA(sdBox(p - vec2(-.36, 4.1), vec2(.07, .75), .05), px) * .7);
    lay(dr, gph, fillA(cap, px));
    lay(dr, gph * 1.4, fillA(collar, px));
    float stripes = step(.5, fract(p.x * 2.4 + uFx.w));
    lay(dr, mix(gph, vec3(.42, .44, .5), stripes), fillA(chuck, px));
    lay(dr, stl, fillA(bit, px));
    lay(dr, vec3(1.), fillA(sdBox(p - vec2(-.03, .95), vec2(.02, .8), .01), px) * .5);
    col = dr * uDrill.w + col * (1. - dr.a * uDrill.w);
  }
  o = col;
}`
