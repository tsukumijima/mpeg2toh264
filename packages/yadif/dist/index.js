const oe = "" + new URL("assets/worker-9zbL8zVP.js", import.meta.url).href, S = `#version 300 es
void main() {
  // From the vertex index alone. There is no geometry here worth a buffer.
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;
function R(n, e, t) {
  const i = n.createProgram(), s = X(n, n.VERTEX_SHADER, t), r = X(n, n.FRAGMENT_SHADER, e);
  if (n.attachShader(i, s), n.attachShader(i, r), n.linkProgram(i), n.deleteShader(s), n.deleteShader(r), !n.getProgramParameter(i, n.LINK_STATUS)) {
    const A = n.getProgramInfoLog(i);
    throw n.deleteProgram(i), new Error(
      `the deinterlacer failed to link: ${A ?? "no reason given"}`
    );
  }
  return i;
}
function X(n, e, t) {
  const i = n.createShader(e);
  if (!i) throw new Error("the deinterlacer could not create a shader");
  if (n.shaderSource(i, t), n.compileShader(i), !n.getShaderParameter(i, n.COMPILE_STATUS)) {
    const s = n.getShaderInfoLog(i);
    throw n.deleteShader(i), new Error(
      `the deinterlacer failed to compile: ${s ?? "no reason given"}`
    );
  }
  return i;
}
const he = `#version 300 es
precision highp float;
uniform sampler2D uTexture;
in vec2 vTextureCoord;
uniform vec3 uTextColor;
uniform vec3 uBackColor;
out vec4 fragColor;

void main() {
  float a = texture(uTexture, vTextureCoord)[3];
  fragColor = vec4(uTextColor * a + uBackColor * (1.0 - a), 1.0);
}
`, ae = `#version 300 es
precision highp float;
in vec4 aVertexPosition;
in vec2 aTextureCoord;
uniform mat4 uMatrix;
uniform mat3 uUvMatrix;
out vec2 vTextureCoord;
out vec3 vTextColor;

void main() {
  gl_Position = uMatrix * aVertexPosition;
  vTextureCoord = vec2(uUvMatrix * vec3(aTextureCoord, 1.0));
}
`;
function ce(n, e) {
  const t = R(n, he, ae), i = n.getAttribLocation(t, "aVertexPosition"), s = n.getAttribLocation(t, "aTextureCoord"), r = n.getUniformLocation(t, "uTexture"), A = n.getUniformLocation(t, "uMatrix"), o = n.getUniformLocation(t, "uUvMatrix"), a = n.getUniformLocation(t, "uTextColor"), l = n.getUniformLocation(t, "uBackColor");
  if (r == null || A == null || o == null || a == null || l == null)
    throw new Error(
      "failed to initialize DEBUG_FRAGMENT_SHADER, DEBUG_VERTEX_SHADER"
    );
  const h = n.createBuffer(), f = n.createBuffer();
  return {
    gl: n,
    ...le(n, e),
    program: t,
    programUniforms: {
      vertex: i,
      textureCoord: s,
      texture: r,
      matrix: A,
      uvMatrix: o,
      textColor: a,
      backColor: l
    },
    positionBuffer: h,
    textureBuffer: f
  };
}
function le(n, e) {
  const t = new OffscreenCanvas(0, 0), i = t.getContext("2d"), s = /* @__PURE__ */ new Map();
  let r = 0;
  const A = 0;
  let o = 1;
  i.font = e, i.fillStyle = "white";
  for (let l = 32; l < 128; l++) {
    const h = String.fromCharCode(l), f = i.measureText(h), d = Math.ceil(
      f.actualBoundingBoxDescent + f.actualBoundingBoxAscent + 1
    ), u = Math.ceil(
      f.actualBoundingBoxLeft + f.actualBoundingBoxRight + 1
    );
    s.set(h, {
      x: r,
      y: A,
      width: u,
      height: d,
      metrics: f
    }), o = Math.max(o, d), r += u;
  }
  t.width = r, t.height = o, i.font = e, i.fillStyle = "white";
  for (const [l, h] of s)
    i.fillText(
      l,
      Math.floor(h.x + h.metrics.actualBoundingBoxLeft + 1),
      Math.floor(h.metrics.actualBoundingBoxAscent + 1)
    );
  const a = n.createTexture();
  return n.bindTexture(n.TEXTURE_2D, a), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, t), { fontTexture: a, chars: s, textureSize: { width: r, height: o } };
}
function ue(n) {
  const e = n.gl;
  e.deleteBuffer(n.positionBuffer), e.deleteBuffer(n.textureBuffer), e.deleteTexture(n.fontTexture), e.deleteProgram(n.program);
}
function fe(n, e, t, i, s, r, A) {
  const o = [], a = [], l = t;
  for (const d of e) {
    if (d === `
`) {
      t = l, i += A;
      continue;
    }
    const u = n.chars.get(d);
    if (u == null)
      continue;
    if (u.width === 1) {
      t += u.metrics.width;
      continue;
    }
    const c = Math.floor(t - u.metrics.actualBoundingBoxLeft), m = Math.floor(i - u.metrics.actualBoundingBoxAscent), v = c + u.width, E = m + u.height;
    o.push(c, m), a.push(u.x, u.y), o.push(c, E), a.push(u.x, u.y + u.height), o.push(c + u.width, E), a.push(u.x + u.width, u.y + u.height), o.push(v, E), a.push(u.x + u.width, u.y + u.height), o.push(c, m), a.push(u.x, u.y), o.push(v, m), a.push(u.x + u.width, u.y), t += u.metrics.width;
  }
  const h = n.gl;
  h.useProgram(n.program), h.bindBuffer(h.ARRAY_BUFFER, n.positionBuffer), h.bufferData(h.ARRAY_BUFFER, new Float32Array(o), h.STATIC_DRAW), h.vertexAttribPointer(
    n.programUniforms.vertex,
    2,
    h.FLOAT,
    !1,
    0,
    0
  ), h.enableVertexAttribArray(n.programUniforms.vertex), h.bindBuffer(h.ARRAY_BUFFER, n.textureBuffer), h.bufferData(
    h.ARRAY_BUFFER,
    new Float32Array(a),
    h.STATIC_DRAW
  ), h.vertexAttribPointer(
    n.programUniforms.textureCoord,
    2,
    h.FLOAT,
    !1,
    0,
    0
  ), h.enableVertexAttribArray(n.programUniforms.textureCoord), h.activeTexture(h.TEXTURE0), h.bindTexture(h.TEXTURE_2D, n.fontTexture), h.uniform1i(n.programUniforms.texture, 0), h.uniform3fv(n.programUniforms.textColor, [1, 1, 1]), h.uniform3fv(n.programUniforms.backColor, [0, 0, 0]);
  function f(d, u, c) {
    const m = [];
    for (let v = 0; v < u; v++)
      for (let E = 0; E < d; E++)
        m.push(c[E * d + v]);
    return m;
  }
  h.uniformMatrix4fv(n.programUniforms.matrix, !1, f(4, 4, [
    1 / (s / 2),
    0,
    0,
    -1,
    0,
    -2 / r,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ])), h.uniformMatrix3fv(n.programUniforms.uvMatrix, !1, f(3, 3, [
    1 / n.textureSize.width,
    0,
    0,
    0,
    1 / n.textureSize.height,
    0,
    0,
    0,
    1
  ])), h.viewport(0, 0, s, r), h.enable(h.BLEND), h.blendFunc(h.SRC_ALPHA, h.ONE_MINUS_SRC_ALPHA), h.drawArrays(h.TRIANGLES, 0, o.length / 2), h.disable(h.BLEND);
}
const p = {
  /** This frame's first field is the previous frame's first field. */
  firstRepeatsPrevious: 0,
  /** This frame's second field is the next frame's second field. */
  secondRepeatsNext: 1,
  /** This frame's second field is the previous frame's second field. */
  secondRepeatsPrevious: 2,
  /** The previous frame's second field was the one before's. */
  previousSecondRepeated: 3,
  /** This frame's first field is the next frame's first field. */
  firstRepeatsNext: 4,
  /** The previous frame's first field was the one before's. */
  previousFirstRepeated: 5,
  phase: 6
}, b = 7, ee = 2, N = 1, de = 2, z = 10, me = {
  a: "uA",
  b: "uB",
  fieldMetrics: "uFieldMetrics",
  first: "uFirst",
  size: "uSize"
}, te = 16, ie = 8, pe = `#version 300 es

precision highp float;

uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uFieldMetrics;

/** The parity of the field captured first. */
uniform int uFirst;
uniform ivec2 uSize;

layout(location = 0) out vec4 outSecond;
layout(location = 1) out vec4 outFirst;

float luma(vec3 c)
{
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec4 measure(float diff, float total, float threshold)
{
  diff /= total;
  return vec4(diff, diff > threshold ? 1.0 : 0.0, diff, 1.0);
}

void main()
{
  const int BLOCK_W = ${te};
  const int BLOCK_H = ${ie};

  ivec2 block = ivec2(gl_FragCoord.xy);
  ivec2 base = ivec2(block.x * BLOCK_W, block.y * BLOCK_H * 2);

  // Even and odd frame lines, summed apart.
  float diffEven = 0.0;
  float diffOdd = 0.0;
  int totalEven = 0;
  int totalOdd = 0;

  for (int y = 0; y < BLOCK_H; ++y) {
    for (int x = 0; x < BLOCK_W; ++x) {
      ivec2 p = base + ivec2(x, y * 2);

      if (p.x < uSize.x && p.y < uSize.y) {
        float a = luma(texelFetch(uA, p, 0).rgb);
        float b = luma(texelFetch(uB, p, 0).rgb);

        // Ignore small compression artifacts when accumulating differences at moving edges.
        diffEven += max(abs(a - b) - 8.0 / 255.0, 0.0);
        totalEven += 1;
      }
      p.y += 1;
      if (p.x < uSize.x && p.y < uSize.y) {
        float a = luma(texelFetch(uA, p, 0).rgb);
        float b = luma(texelFetch(uB, p, 0).rgb);

        diffOdd += max(abs(a - b) - 8.0 / 255.0, 0.0);
        totalOdd += 1;
      }
    }
  }

  float run = texelFetch(uFieldMetrics, ivec2(${p.phase}, 0), 0)[1];
  float threshold = run == 0.0 ? 0.025 : (run <= 10.0 ? 0.11 : 0.15);

  vec4 even = measure(diffEven, float(totalEven), threshold);
  vec4 odd = measure(diffOdd, float(totalOdd), threshold);
  outFirst = uFirst == 0 ? even : odd;
  outSecond = uFirst == 0 ? odd : even;
}
`, ve = {
  second: "uSecond",
  first: "uFirst",
  size: "uSize"
}, _ = 8, Ee = `#version 300 es
precision highp float;

uniform sampler2D uSecond;
uniform sampler2D uFirst;

uniform ivec2 uSize;

layout(location = 0) out vec4 outSecond;
layout(location = 1) out vec4 outFirst;

void main()
{
  ivec2 dst = ivec2(gl_FragCoord.xy);
  ivec2 base = dst * ${_};

  vec4 second = vec4(0.0);
  vec4 first = vec4(0.0);

  for (int y = 0; y < ${_}; ++y) {
    for (int x = 0; x < ${_}; ++x) {
      ivec2 p = base + ivec2(x, y);

      if (p.x < uSize.x && p.y < uSize.y) {
        vec4 value = texelFetch(uSecond, p, 0);
        second[0] = max(second[0], value[0]);
        second.yzw += value.yzw;
        value = texelFetch(uFirst, p, 0);
        first[0] = max(first[0], value[0]);
        first.yzw += value.yzw;
      }
    }
  }

  outSecond = second;
  outFirst = first;
}
`, we = {
  previous: "uPrevious",
  second: "uSecond",
  first: "uFirst",
  size: "uSize"
}, be = `#version 300 es
precision highp float;

uniform sampler2D uPrevious;
uniform sampler2D uSecond;
uniform sampler2D uFirst;

/** The size of the reduced comparisons. */
uniform ivec2 uSize;

out vec4 outValue;

vec4 previous(int metric) {
  return texelFetch(uPrevious, ivec2(metric, 0), 0);
}

/** Fold what REDUCTION left into one texel. */
vec4 fold(sampler2D reduced) {
  vec4 sum = vec4(0.0);
  for (int y = 0; y < uSize.y; ++y) {
    for (int x = 0; x < uSize.x; ++x) {
      vec4 value = texelFetch(reduced, ivec2(x, y), 0);
      sum[0] = max(sum[0], value[0]);
      sum.yzw += value.yzw;
    }
  }
  return vec4(sum[0], sum[1], sum[2] / max(sum[3], 1.0), sum[3]);
}

bool same(float differing) {
  return differing <= ${ee}.0;
}

// A repeated field changes less than the opposite field.
// Distinguish motion shared by both fields from a still image with small absolute differences.
bool repeats(vec4 field, vec4 other) {
  return same(field[1]) &&
    (max(field[0], other[0]) < 0.025 || field[2] < other[2] * 0.75);
}

/** The phase texel, (phase, run), from the six comparisons' differing counts. */
vec4 decide(vec4 last, vec4 dFirstRepeatsPrevious, vec4 dSecondRepeatsNext,
            vec4 dSecondRepeatsPrevious, vec4 dPreviousSecondRepeated,
            vec4 dFirstRepeatsNext, vec4 dPreviousFirstRepeated)
{
  bool firstRepeatsPrevious = repeats(dFirstRepeatsPrevious, dSecondRepeatsPrevious);
  bool secondRepeatsNext = repeats(dSecondRepeatsNext, dFirstRepeatsNext);
  bool secondRepeatsPrevious = repeats(dSecondRepeatsPrevious, dFirstRepeatsPrevious);
  bool previousSecondRepeated = repeats(dPreviousSecondRepeated, dPreviousFirstRepeated);
  bool firstRepeatsNext = repeats(dFirstRepeatsNext, dSecondRepeatsNext);
  bool previousFirstRepeated = repeats(dPreviousFirstRepeated, dPreviousSecondRepeated);
  bool still = (firstRepeatsPrevious && secondRepeatsPrevious) || (secondRepeatsNext && firstRepeatsNext);

  int previous = int(last[0]);
  float run = last[1];
  // What each phase looks like: one field repeats, the other plainly does not.
  bool looks1 = firstRepeatsPrevious && !secondRepeatsPrevious;
  bool looks2 = secondRepeatsNext && !firstRepeatsNext;
  bool looks3 = secondRepeatsPrevious && !firstRepeatsPrevious;
  bool looks4 = previousSecondRepeated && !previousFirstRepeated;
  bool looks5 = firstRepeatsNext && !secondRepeatsNext;

  int expected = previous == 0 ? 0 : (previous == 5 ? 1 : previous + 1);
  bool expectedRepeat =
    expected == 1 ? firstRepeatsPrevious :
    expected == 2 ? secondRepeatsNext :
    expected == 3 ? secondRepeatsPrevious :
    expected == 4 ? previousSecondRepeated :
    expected == 5 ? firstRepeatsNext : false;
  bool expectedLooks =
    expected == 1 ? looks1 :
    expected == 2 ? looks2 :
    expected == 3 ? looks3 :
    expected == 4 ? looks4 :
    expected == 5 ? looks5 : false;
  bool believed = run >= ${z}.0;
  bool carried = believed ? expectedRepeat : expectedLooks;

  int phase = 0;
  if (expected != 0 && carried) {
    phase = expected;
    run += 1.0;
  } else if (expected != 0 && (still || expectedRepeat)) {
    // Uninformative: keeps the cycle's place, counts only once believed.
    phase = expected;
    if (believed) run += 1.0;
  } else if (looks1) {
    phase = 1;
  } else if (looks2) {
    phase = 2;
  } else if (looks3) {
    phase = 3;
  } else if (looks4) {
    phase = 4;
  } else if (looks5) {
    phase = 5;
  }
  if (phase != expected) run = phase != 0 ? 1.0 : 0.0;
  return vec4(float(phase), run, 0.0, 0.0);
}

void main()
{
  int metric = int(gl_FragCoord.x);
  // The comparisons against the next frame become, a frame later, the ones
  // against the previous frame, and those the ones before.
  if (metric == ${p.firstRepeatsPrevious}) {
    outValue = previous(${p.firstRepeatsNext});
  } else if (metric == ${p.secondRepeatsNext}) {
    outValue = fold(uSecond);
  } else if (metric == ${p.secondRepeatsPrevious}) {
    outValue = previous(${p.secondRepeatsNext});
  } else if (metric == ${p.previousSecondRepeated}) {
    outValue = previous(${p.secondRepeatsPrevious});
  } else if (metric == ${p.firstRepeatsNext}) {
    outValue = fold(uFirst);
  } else if (metric == ${p.previousFirstRepeated}) {
    outValue = previous(${p.firstRepeatsPrevious});
  } else {
    outValue = decide(
      previous(${p.phase}),
      previous(${p.firstRepeatsNext}),
      fold(uSecond),
      previous(${p.secondRepeatsNext}),
      previous(${p.secondRepeatsPrevious}),
      fold(uFirst),
      previous(${p.firstRepeatsPrevious})
    );
  }
}
`, T = 16, xe = 8, ge = {
  prev: "uPrev",
  cur: "uCur",
  first: "uFirst",
  size: "uSize"
}, ye = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uPrev;
uniform sampler2D uCur;
/** The parity of the lines of the field captured first. */
uniform int uFirst;
uniform ivec2 uSize;

out vec4 outValue;

const float COMB = 8.0 / 255.0;

float luma(sampler2D image, int x, int y) {
  int line = y < 0 ? -y : (y >= uSize.y ? 2 * (uSize.y - 1) - y : y);
  vec3 c = texelFetch(image, ivec2(x, clamp(line, 0, uSize.y - 1)), 0).rgb;
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

bool combed(float above2, float above, float pixel, float below, float below2) {
  float d1 = pixel - above;
  float d2 = pixel - below;
  return ((d1 > COMB && d2 > COMB) || (d1 < -COMB && d2 < -COMB)) &&
    abs(above2 + 4.0 * pixel + below2 - 3.0 * (above + below)) > 6.0 * COMB;
}

void main() {
  // Block rows count from the top of the frame, as the filter reads them.
  ivec2 block = ivec2(gl_FragCoord.xy);
  ivec2 base = block * ${T};
  float standing = 0.0;
  float woven = 0.0;
  for (int dy = 0; dy < ${T}; ++dy) {
    int y = base.y + dy;
    if (y >= uSize.y || (y & 1) == uFirst) continue;
    for (int dx = 0; dx < ${T}; ++dx) {
      int x = base.x + dx;
      if (x >= uSize.x) break;
      float current = luma(uCur, x, y);
      float previous = luma(uPrev, x, y);
      if (abs(current - previous) <= COMB) continue;
      // The first field's lines either side are the same whichever second
      // field is woven between them.
      float above = luma(uCur, x, y - 1);
      float below = luma(uCur, x, y + 1);
      if (combed(luma(uCur, x, y - 2), above, current, below, luma(uCur, x, y + 2)))
        standing += 1.0;
      if (combed(luma(uPrev, x, y - 2), above, previous, below, luma(uPrev, x, y + 2)))
        woven += 1.0;
    }
  }
  outValue = vec4(standing, woven, 0.0, 0.0);
}
`, Te = {
  prev: "uPrev",
  cur: "uCur",
  next: "uNext",
  size: "uSize",
  parity: "uParity",
  tff: "uTff",
  spatialCheck: "uSpatialCheck",
  debug: "uDebug",
  film: "uFilm",
  second: "uSecond",
  phase: "uPhase",
  fieldMetrics: "uFieldMetrics",
  comb: "uComb"
}, Fe = `#version 300 es
precision highp float;
precision highp int;

uniform sampler2D uPrev;
uniform sampler2D uCur;
uniform sampler2D uNext;
uniform sampler2D uFieldMetrics;
uniform sampler2D uComb;
/** The size of a frame in texels. */
uniform ivec2 uSize;
/** The parity of the lines that are kept; the others are interpolated. */
uniform int uParity;
/** Whether the first field of a frame is its top field. */
uniform int uTff;
/** Whether the temporal bound is widened by the local vertical range. */
uniform bool uSpatialCheck;
uniform bool uDebug;
uniform bool uFilm;
uniform bool uSecond;
uniform int uPhase;

out vec4 fragColor;

/**
 * A texel, with the edges of the frame mirrored.
 *
 * The reference reflects its line offsets on the first and last line rather
 * than reading outside the frame, and this is the same thing said once.
 */
vec3 fetch(sampler2D image, int x, int y) {
  int line = y < 0 ? -y : (y >= uSize.y ? 2 * (uSize.y - 1) - y : y);
  return texelFetch(image, ivec2(clamp(x, 0, uSize.x - 1), clamp(line, 0, uSize.y - 1)), 0).rgb;
}

/**
 * Interpolate the missing line along whichever direction the picture runs in.
 *
 * a..g are the seven texels of the line above and h..n those of the line
 * below, both centred on the pixel being built. The straight vertical average
 * is the starting point, and each candidate direction is taken only if the
 * three differences across it are smaller than the best so far; the steeper
 * pair of directions is only considered when the shallower one was an
 * improvement, which is what keeps a busy picture from finding an edge that is
 * not there.
 */
vec3 spatialPredictor(vec3 a, vec3 b, vec3 c, vec3 d, vec3 e, vec3 f, vec3 g,
                      vec3 h, vec3 i, vec3 j, vec3 k, vec3 l, vec3 m, vec3 n) {
  vec3 pred = (d + k) * 0.5;
  vec3 best = abs(c - j) + abs(d - k) + abs(e - l);

  vec3 score = abs(b - k) + abs(c - l) + abs(d - m);
  vec3 taken = vec3(lessThan(score, best));
  pred = mix(pred, (c + l) * 0.5, taken);
  best = mix(best, score, taken);

  score = abs(a - l) + abs(b - m) + abs(c - n);
  taken *= vec3(lessThan(score, best));
  pred = mix(pred, (b + m) * 0.5, taken);
  best = mix(best, score, taken);

  score = abs(d - i) + abs(e - j) + abs(f - k);
  taken = vec3(lessThan(score, best));
  pred = mix(pred, (e + j) * 0.5, taken);
  best = mix(best, score, taken);

  score = abs(e - h) + abs(f - i) + abs(g - j);
  taken *= vec3(lessThan(score, best));
  pred = mix(pred, (f + i) * 0.5, taken);

  return pred;
}

/**
 * Hold the spatial guess to what the moving picture allows.
 *
 * p2 is where the line would be if nothing moved -- the average of the same
 * line in the two frames that bracket this moment -- and the three temporal
 * differences say how much did move. The spatial guess is then clamped to that
 * distance from p2: still picture, and the answer is the line that is really
 * there; motion, and the interpolation is free to take over.
 */
vec3 temporalPredictor(vec3 A, vec3 B, vec3 C, vec3 D, vec3 E, vec3 F,
                       vec3 G, vec3 H, vec3 I, vec3 J, vec3 K, vec3 L,
                       vec3 spatialPred, bool skipCheck) {
  vec3 p0 = (C + H) * 0.5;
  vec3 p1 = F;
  vec3 p2 = (D + I) * 0.5;
  vec3 p3 = G;
  vec3 p4 = (E + J) * 0.5;

  vec3 tdiff0 = abs(D - I) * 0.5;
  vec3 tdiff1 = (abs(A - F) + abs(B - G)) * 0.5;
  vec3 tdiff2 = (abs(K - F) + abs(G - L)) * 0.5;

  vec3 diff = max(tdiff0, max(tdiff1, tdiff2));

  if (!skipCheck) {
    vec3 hi = max(p2 - p3, max(p2 - p1, min(p0 - p1, p4 - p3)));
    vec3 lo = min(p2 - p3, min(p2 - p1, max(p0 - p1, p4 - p3)));
    diff = max(diff, max(lo, -hi));
  }

  return clamp(spatialPred, p2 - diff, p2 + diff);
}

/**
 * Build one interpolated pixel.
 *
 * prev2 and next2 are the frames the missing line is bracketed by, which is
 * not the same pair as prev and next: the field being rebuilt is half a frame
 * from one of its neighbours and one and a half from the other, and it is the
 * near pair that says what the picture looked like around this moment. prev
 * and next themselves are still read, for the two motion measurements.
 */
vec3 filterPixel(sampler2D prev2, sampler2D next2, int x, int y) {
  vec3 a = fetch(uCur, x - 3, y - 1);
  vec3 b = fetch(uCur, x - 2, y - 1);
  vec3 c = fetch(uCur, x - 1, y - 1);
  vec3 d = fetch(uCur, x, y - 1);
  vec3 e = fetch(uCur, x + 1, y - 1);
  vec3 f = fetch(uCur, x + 2, y - 1);
  vec3 g = fetch(uCur, x + 3, y - 1);

  vec3 h = fetch(uCur, x - 3, y + 1);
  vec3 i = fetch(uCur, x - 2, y + 1);
  vec3 j = fetch(uCur, x - 1, y + 1);
  vec3 k = fetch(uCur, x, y + 1);
  vec3 l = fetch(uCur, x + 1, y + 1);
  vec3 m = fetch(uCur, x + 2, y + 1);
  vec3 n = fetch(uCur, x + 3, y + 1);

  // Within three texels of either side there is no room to look along an edge,
  // so the reference takes the vertical average there and so does this.
  bool interior = x >= 3 && x + 3 < uSize.x;
  vec3 spatialPred = interior ? spatialPredictor(a, b, c, d, e, f, g, h, i, j, k, l, m, n)
                              : (d + k) * 0.5;

  vec3 A = fetch(uPrev, x, y - 1);
  vec3 B = fetch(uPrev, x, y + 1);
  vec3 C = fetch(prev2, x, y - 2);
  vec3 D = fetch(prev2, x, y);
  vec3 E = fetch(prev2, x, y + 2);
  vec3 F = d;
  vec3 G = k;
  vec3 H = fetch(next2, x, y - 2);
  vec3 I = fetch(next2, x, y);
  vec3 J = fetch(next2, x, y + 2);
  vec3 K = fetch(uNext, x, y - 1);
  vec3 L = fetch(uNext, x, y + 1);

  // The first and last line the filter builds have only one line of picture
  // outside them, so the range the spatial check would be measured over is not
  // there. The reference drops the check on those two lines.
  bool skipCheck = !uSpatialCheck || y < 2 || y + 2 >= uSize.y;
  return temporalPredictor(A, B, C, D, E, F, G, H, I, J, K, L, spatialPred, skipCheck);
}

int firstParity() {
  return uTff != 0 ? 0 : 1;
}

bool same(int metric) {
  return texelFetch(uFieldMetrics, ivec2(metric, 0), 0)[1] <= ${ee}.0;
}

/** The pulldown phase the detection gave this frame, or 0. See film-shader.ts. */
int detectedPhase() {
  vec4 phase = texelFetch(uFieldMetrics, ivec2(${p.phase}, 0), 0);
  // Deinterlace each field normally until the cadence is confirmed.
  return phase[1] >= ${z}.0 ? int(phase[0]) : 0;
}

bool isMixedPhase(int phase) {
  return phase == ${N} || phase == ${de};
}

/** Detect new combing in phase 4, whose cadence is inferred from previous repeats. */
bool movingComb(vec3 pixel, int x, int y) {
  vec3 above = fetch(uCur, x, y - 1);
  vec3 below = fetch(uCur, x, y + 1);
  vec3 comb = max(min(above, below) - pixel, pixel - max(above, below));
  // Phase 3 is a complete film frame, so use its vertical detail as the reference.
  // Preserve existing horizontal lines and interpolate only pixels with new combing.
  vec3 previous = fetch(uPrev, x, y);
  vec3 previousAbove = fetch(uPrev, x, y - 1);
  vec3 previousBelow = fetch(uPrev, x, y + 1);
  vec3 previousComb = max(min(previousAbove, previousBelow) - previous,
                          previous - max(previousAbove, previousBelow));
  return any(greaterThan(comb, max(previousComb, vec3(0.0)) + vec3(8.0 / 255.0)));
}

const int DEBUG_BAR_CELL = 32;
const int DEBUG_BAR_WIDTH = DEBUG_BAR_CELL * 7;
const int DEBUG_BAR_HEIGHT = 16;

vec3 debugBar(int x) {
  int cell = x / DEBUG_BAR_CELL;
  bool lit = x % DEBUG_BAR_CELL >= DEBUG_BAR_CELL - 4;
  if (cell == 6) return lit || uSecond ? vec3(1.0, 0.0, 0.0) : vec3(0.0);
  return lit || same(cell) ? vec3(1.0) : vec3(0.0);
}

const int DIGIT_WIDTH = 24;
const int DIGIT_HEIGHT = 60;

bool digitLit(int digit, int x, int y) {
  bool a = y < 20;
  bool b = x >= 20 && y < 40;
  bool c = x >= 20 && y >= 40;
  bool d = y >= 56;
  bool e = x < 4 && y >= 40;
  bool f = x < 4 && y < 40;
  bool g = y >= 36 && y < 40;
  switch (digit) {
    case 1: return b || c;
    case 2: return a || b || d || e || g;
    case 3: return a || b || c || d || g;
    case 4: return b || c || f || g;
    case 5: return a || c || d || f || g;
    default: return false;
  }
}

void main() {
  ivec2 at = ivec2(gl_FragCoord.xy);
  int x = at.x;
  // The framebuffer counts its rows from the bottom and a frame from the top.
  int y = uSize.y - 1 - at.y;

  vec3 rgb;
  if (uFilm && uDebug && y < DEBUG_BAR_HEIGHT && x < DEBUG_BAR_WIDTH) {
    rgb = debugBar(x);
  } else if (uFilm && uDebug && x < DIGIT_WIDTH && y < DIGIT_HEIGHT && uPhase > 0) {
    rgb = digitLit(uPhase, x, y) ? vec3(1.0, 0.0, 0.0) : vec3(0.0);
  } else if (uFilm && !uSecond && detectedPhase() != 0) {
    bool mixed = isMixedPhase(detectedPhase());
    rgb = mixed && (y & 1) != firstParity()
      ? texelFetch(uPrev, ivec2(x, y), 0).rgb
      : texelFetch(uCur, ivec2(x, y), 0).rgb;
    // A block the weave would leave combed -- a cut, a fade or a telop that
    // does not follow the cadence -- is filtered like video instead.
    vec4 comb = texelFetch(uComb, ivec2(x / ${T}, y / ${T}), 0);
    bool combedBlock = (mixed ? comb[1] : comb[0]) > ${xe}.0;
    if ((y & 1) != uParity &&
        (combedBlock || (detectedPhase() == 4 && movingComb(rgb, x, y))))
      rgb = filterPixel(uPrev, uCur, x, y);
  } else if ((y & 1) == uParity) {
    rgb = texelFetch(uCur, ivec2(x, y), 0).rgb;
  } else if ((uParity ^ uTff) != 0) {
    // The first field of the frame: the moment it holds sits between the
    // previous frame and the second field of this one.
    rgb = filterPixel(uPrev, uCur, x, y);
  } else {
    rgb = filterPixel(uCur, uNext, x, y);
  }
  fragColor = vec4(rgb, 1.0);
}
`, x = { phase: 0, run: 0 };
function C(n, e, t) {
  return Object.fromEntries(
    Object.entries(t).map(([i, s]) => [
      i,
      n.getUniformLocation(e, s)
    ])
  );
}
class W {
  #t;
  #n;
  #e;
  #o;
  #i;
  #r;
  #m;
  #c;
  #b;
  /** The block comparisons of both fields, and the same folded most of the way. */
  #E = null;
  #w = null;
  /** Combed pixels per block of the frame being filtered, both ways of weaving it. */
  #h = null;
  /** The field metrics (see FIELD_METRICS) of this frame and the one before. */
  #A = null;
  /** Which of the two holds the newest metrics. */
  #l = 0;
  /** The metrics being read back asynchronously. */
  #u = null;
  #s = null;
  #a = 0;
  #I = 0;
  /** The last metrics read back, laid out as FIELD_METRICS says. */
  metrics = new Float32Array(b * 4);
  #f = 0;
  #p = 0;
  constructor(e) {
    this.#t = e, this.#n = R(
      e,
      pe,
      S
    ), this.#e = C(
      e,
      this.#n,
      me
    ), this.#o = R(
      e,
      Ee,
      S
    ), this.#i = C(
      e,
      this.#o,
      ve
    ), this.#r = R(
      e,
      be,
      S
    ), this.#m = C(e, this.#r, we), this.#c = R(e, ye, S), this.#b = C(e, this.#c, ge);
  }
  /** The newest measurements, or null before any frame has been measured. */
  get texture() {
    return this.#A?.[this.#l]?.textures[0] ?? null;
  }
  /**
   * Combed pixels per block of the frame last measured by `measureComb`, or
   * null before one has been. See COMB_FRAGMENT_SHADER.
   */
  get combTexture() {
    return this.#h?.textures[0] ?? null;
  }
  /** The size of the frames to be measured, which sizes the block grid. */
  resize(e, t) {
    e === this.#f && t === this.#p || (this.#f = e, this.#p = t, this.#D());
  }
  /** Forget every measurement: the next frame starts a cycle from nothing. */
  reset() {
    const e = this.#t;
    e.deleteSync(this.#s), this.#s = null, this.#a = 0;
    const t = this.#A?.[this.#l];
    if (!t) return;
    const i = new Float32Array(b * 4);
    for (let s = 0; s < p.phase; s++)
      i[s * 4 + 1] = 1;
    e.bindTexture(e.TEXTURE_2D, t.textures[0] ?? null), e.texSubImage2D(
      e.TEXTURE_2D,
      0,
      0,
      0,
      b,
      1,
      e.RGBA,
      e.FLOAT,
      i
    );
  }
  /**
   * Detect the pulldown phase of `cur`, the frame being filtered, against
   * `next`, and start reading it back. Only the two comparisons against the
   * next frame are measured; the rest are earlier ones moved along a frame.
   * `first` is the parity of the field that was captured first.
   */
  detect(e, t, i) {
    const s = this.#t;
    if (this.#f === 0 || this.#p === 0) return;
    this.#M();
    const r = this.#E, A = this.#w, o = this.#A;
    if (r === null || A === null || o === null) return;
    const a = o[this.#l], l = o[1 - this.#l];
    if (s.bindFramebuffer(s.FRAMEBUFFER, r.framebuffer), s.useProgram(this.#n), this.#F(0, e, this.#e.a), this.#F(1, t, this.#e.b), this.#F(2, a.textures[0], this.#e.fieldMetrics), s.uniform1i(this.#e.first, i), s.uniform2i(this.#e.size, this.#f, this.#p), s.viewport(0, 0, r.width, r.height), s.drawArrays(s.TRIANGLES, 0, 3), s.bindFramebuffer(s.FRAMEBUFFER, A.framebuffer), s.useProgram(this.#o), this.#F(0, r.textures[0], this.#i.second), this.#F(1, r.textures[1], this.#i.first), s.uniform2i(this.#i.size, r.width, r.height), s.viewport(0, 0, A.width, A.height), s.drawArrays(s.TRIANGLES, 0, 3), s.bindFramebuffer(s.FRAMEBUFFER, l.framebuffer), s.useProgram(this.#r), this.#F(0, a.textures[0], this.#m.previous), this.#F(1, A.textures[0], this.#m.second), this.#F(2, A.textures[1], this.#m.first), s.uniform2i(this.#m.size, A.width, A.height), s.viewport(0, 0, b, 1), s.drawArrays(s.TRIANGLES, 0, 3), this.#l = 1 - this.#l, this.#a++, this.#s !== null) {
      s.bindFramebuffer(s.FRAMEBUFFER, null);
      return;
    }
    this.#I = this.#a, s.bindBuffer(s.PIXEL_PACK_BUFFER, this.#u), s.readPixels(0, 0, b, 1, s.RGBA, s.FLOAT, 0), s.bindBuffer(s.PIXEL_PACK_BUFFER, null), s.bindFramebuffer(s.FRAMEBUFFER, null), this.#s = s.fenceSync(s.SYNC_GPU_COMMANDS_COMPLETE, 0), s.flush();
  }
  /**
   * Count the combing each way of weaving `cur`, the frame being filtered,
   * would leave: as it stands, and with `prev`'s second field. `first` is the
   * parity of the field that was captured first.
   */
  measureComb(e, t, i) {
    const s = this.#t;
    if (this.#f === 0 || this.#p === 0) return;
    this.#M();
    const r = this.#h;
    r !== null && (s.bindFramebuffer(s.FRAMEBUFFER, r.framebuffer), s.useProgram(this.#c), this.#F(0, e, this.#b.prev), this.#F(1, t, this.#b.cur), s.uniform1i(this.#b.first, i), s.uniform2i(this.#b.size, this.#f, this.#p), s.viewport(0, 0, r.width, r.height), s.drawArrays(s.TRIANGLES, 0, 3), s.bindFramebuffer(s.FRAMEBUFFER, null));
  }
  /**
   * The phase of the last frame measured, once the GPU has handed it back,
   * and null while it is still on its way. It is handed back once.
   */
  poll() {
    const e = this.#t, t = this.#s;
    if (t === null || this.#u === null) return null;
    switch (e.clientWaitSync(t, 0, 0)) {
      case e.ALREADY_SIGNALED:
      case e.CONDITION_SATISFIED:
        return e.bindBuffer(e.PIXEL_PACK_BUFFER, this.#u), e.getBufferSubData(e.PIXEL_PACK_BUFFER, 0, this.metrics), e.bindBuffer(e.PIXEL_PACK_BUFFER, null), e.deleteSync(t), this.#s = null, {
          phase: this.metrics[p.phase * 4] ?? 0,
          run: this.metrics[p.phase * 4 + 1] ?? 0,
          age: this.#a - this.#I
        };
      default:
        return null;
    }
  }
  destroy() {
    const e = this.#t;
    if (this.#D(), this.#A !== null) {
      for (const t of this.#A) M(e, t);
      this.#A = null;
    }
    e.deleteSync(this.#s), this.#s = null, e.deleteBuffer(this.#u), this.#u = null, e.deleteProgram(this.#n), e.deleteProgram(this.#o), e.deleteProgram(this.#r), e.deleteProgram(this.#c);
  }
  #F(e, t, i) {
    const s = this.#t;
    s.activeTexture(s.TEXTURE0 + e), s.bindTexture(s.TEXTURE_2D, t ?? null), s.uniform1i(i, e);
  }
  #D() {
    const e = this.#t;
    this.#E !== null && M(e, this.#E), this.#w !== null && M(e, this.#w), this.#h !== null && M(e, this.#h), this.#E = null, this.#w = null, this.#h = null;
  }
  /** Everything detect needs that is not there yet. */
  #M() {
    const e = this.#t;
    if (this.#E === null || this.#w === null || this.#h === null) {
      this.#D();
      const t = Math.ceil(this.#f / te), i = Math.ceil(this.#p / (ie * 2));
      this.#E = D(e, t, i, 2), this.#w = D(
        e,
        Math.ceil(t / _),
        Math.ceil(i / _),
        2
      ), this.#h = D(
        e,
        Math.ceil(this.#f / T),
        Math.ceil(this.#p / T),
        1
      );
    }
    this.#A === null && (this.#A = [
      D(e, b, 1, 1),
      D(e, b, 1, 1)
    ], this.#l = 0, this.reset()), this.#u === null && (this.#u = e.createBuffer(), e.bindBuffer(e.PIXEL_PACK_BUFFER, this.#u), e.bufferData(
      e.PIXEL_PACK_BUFFER,
      this.metrics.byteLength,
      e.STREAM_COPY
    ), e.bindBuffer(e.PIXEL_PACK_BUFFER, null));
  }
}
function D(n, e, t, i) {
  const s = n.createFramebuffer();
  n.bindFramebuffer(n.FRAMEBUFFER, s);
  const r = [];
  for (let a = 0; a < i; a++) {
    const l = n.createTexture();
    n.bindTexture(n.TEXTURE_2D, l), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texImage2D(
      n.TEXTURE_2D,
      0,
      n.RGBA32F,
      e,
      t,
      0,
      n.RGBA,
      n.FLOAT,
      null
    ), n.framebufferTexture2D(
      n.FRAMEBUFFER,
      n.COLOR_ATTACHMENT0 + a,
      n.TEXTURE_2D,
      l,
      0
    ), r.push(l);
  }
  n.drawBuffers(r.map((a, l) => n.COLOR_ATTACHMENT0 + l));
  const A = n.checkFramebufferStatus(n.FRAMEBUFFER) === n.FRAMEBUFFER_COMPLETE;
  n.bindFramebuffer(n.FRAMEBUFFER, null);
  const o = { framebuffer: s, textures: r, width: e, height: t };
  if (!A)
    throw M(n, o), new Error("failed to allocate framebuffer");
  return o;
}
function M(n, { framebuffer: e, textures: t }) {
  n.deleteFramebuffer(e);
  for (const i of t) n.deleteTexture(i);
}
function y(n, e = 0, t = n.length) {
  const i = new DataView(n.buffer, n.byteOffset, n.byteLength), s = [];
  for (let r = e; r < t; ) {
    if (r + 8 > t) throw new Error("Incomplete MP4 box");
    const A = i.getUint32(r);
    if (A < 8 || r + A > t) throw new Error("Invalid MP4 box size");
    s.push({
      type: String.fromCharCode(...n.subarray(r + 4, r + 8)),
      start: r,
      body: r + 8,
      end: r + A
    }), r += A;
  }
  return s;
}
function De(n, e) {
  for (const t of y(n, e.body, e.end).filter(
    (i) => i.type === "trak"
  )) {
    let i = t;
    for (const s of ["mdia", "minf", "stbl", "stsd"]) {
      const r = y(n, i.body, i.end).find(
        (A) => A.type === s
      );
      if (!r) break;
      i = r;
    }
    if (i.type === "stsd")
      for (const s of y(n, i.body + 8, i.end)) {
        if (s.type !== "avc1") continue;
        const r = y(n, s.body + 78, s.end).find(
          (a) => a.type === "avcC"
        );
        if (!r) throw new Error("AVC sample entry has no avcC");
        const A = n.slice(r.body, r.end);
        return { codec: "avc1." + Array.from(A.subarray(1, 4)).map((a) => a.toString(16).padStart(2, "0")).join(""), description: A };
      }
  }
  return null;
}
class Re {
  #t;
  #n = null;
  #e = null;
  /** Compressed frames within the MSE buffer, retained at normal speed for seeks and later accelerated playback. */
  #o = [];
  #i = 0;
  #r = null;
  #m = [];
  /** Timestamps of one-tick duplicate pictures needed only as open-GOP decoding references. */
  #c = /* @__PURE__ */ new Set();
  #b = !1;
  #E = !1;
  #w = !1;
  #h = !1;
  #A = !1;
  #l = /* @__PURE__ */ new WeakMap();
  constructor(e) {
    this.#t = e, e.addEventListener("seeking", this.#s), e.addEventListener("ratechange", this.#s);
  }
  get active() {
    return this.#h;
  }
  /** Receive input in MSE append order; the caller retains ownership of the original ArrayBuffer. */
  append(e) {
    if (this.#w) return;
    const t = new Uint8Array(e), i = new DataView(e);
    try {
      for (const r of y(t)) {
        if (r.type === "moov") {
          this.#n = De(t, r);
          const A = this.#n;
          A && VideoDecoder.isConfigSupported(A).then((o) => {
            this.#l.set(A, o.supported === !0);
          }).catch((o) => this.#a(o));
        }
        if (!(r.type !== "moof" || this.#n === null))
          for (const A of y(t, r.body, r.end).filter(
            (o) => o.type === "traf"
          )) {
            const o = y(t, A.body, A.end), a = o.find((c) => c.type === "tfhd");
            if (!a || i.getUint32(a.body + 4) !== 1) continue;
            const l = o.find((c) => c.type === "tfdt"), h = o.find((c) => c.type === "trun");
            if (!l || !h || i.getUint32(l.body) !== 16777216 || i.getUint32(h.body) !== 16781057)
              throw new Error("Unexpected mpeg2toh264 video fragment layout");
            let f = Number(i.getBigUint64(l.body + 4)), d = r.start + i.getInt32(h.body + 8);
            const u = i.getUint32(h.body + 4);
            if (h.body + 12 + u * 16 > h.end)
              throw new Error("Incomplete video samples");
            for (let c = 0; c < u; c++) {
              const m = h.body + 12 + c * 16, v = i.getUint32(m), E = i.getUint32(m + 4), L = i.getUint32(m + 8), Ae = i.getInt32(m + 12);
              if (d < 0 || d + E > t.length)
                throw new Error("Video sample outside fragment");
              this.#o.push({
                config: this.#n,
                decodeTime: f / 9e4,
                timestamp: Math.round((f + Ae) * 1e6 / 9e4),
                duration: Math.round(v * 1e6 / 9e4),
                type: L & 65536 ? "delta" : "key",
                data: t.subarray(d, d + E)
              }), f += v, d += E;
            }
          }
      }
      const s = this.#t.buffered;
      if (s.length > 0) {
        let r = 0;
        for (let A = 0; A < (this.#h ? this.#i : this.#o.length); A++) {
          const o = this.#o[A];
          o.type === "key" && o.timestamp / 1e6 <= s.start(0) && (r = A);
        }
        r > 0 && (this.#o.splice(0, r), this.#i = Math.max(0, this.#i - r));
      }
    } catch (s) {
      this.#a(s);
    }
  }
  /** Return undefined to use the video element, or null to wait for the next decoded frame. */
  take() {
    if (this.#w || this.#t.playbackRate <= 1.25 || this.#n === null || this.#l.get(this.#n) !== !0) {
      this.#h && this.#s();
      return;
    }
    this.#h || (this.#s(), this.#h = !0);
    const e = this.#t.currentTime;
    try {
      for (; this.#i < this.#o.length && (this.#r?.decodeQueueSize ?? 0) < 6 && this.#m.length < 12; ) {
        const i = this.#o[this.#i];
        if (i.decodeTime > e + 0.25) break;
        if (this.#e !== i.config) {
          if (this.#r) {
            if (!this.#E) {
              this.#E = !0;
              const r = this.#r;
              r.flush().then(() => {
                this.#r === r && (r.close(), this.#r = null, this.#e = null, this.#E = !1);
              }).catch((A) => {
                this.#r === r && this.#a(A);
              });
            }
            break;
          }
          const s = new VideoDecoder({
            output: (r) => {
              this.#r !== s ? r.close() : this.#u(r);
            },
            error: (r) => {
              this.#r === s && this.#a(r);
            }
          });
          this.#r = s, this.#r.configure(i.config), this.#e = i.config;
        }
        (i.duration ?? 0) < 1e3 && this.#c.add(i.timestamp), this.#r.decode(new EncodedVideoChunk(i)), this.#i++;
      }
      if (this.#b && this.#i === this.#o.length && this.#r && !this.#E) {
        this.#E = !0;
        const i = this.#r;
        i.flush().catch((s) => {
          this.#r === i && this.#a(s);
        });
      }
    } catch (i) {
      this.#a(i);
      return;
    }
    const t = this.#m[0];
    return !t || t.timestamp / 1e6 > e + 3e-3 * this.#t.playbackRate ? this.#A ? null : void 0 : (this.#A = !0, this.#m.shift());
  }
  #u = (e) => {
    this.#c.delete(e.timestamp) || e.timestamp / 1e6 < this.#t.currentTime - (this.#A ? 0.1 : 0.04) ? e.close() : this.#m.push(e);
  };
  #s = () => {
    this.#r && this.#r.state !== "closed" && this.#r.close(), this.#r = null, this.#e = null;
    for (const e of this.#m) e.close();
    this.#m = [], this.#c.clear(), this.#E = !1, this.#h = !1, this.#A = !1, this.#i = 0;
    for (let e = 0; e < this.#o.length; e++) {
      const t = this.#o[e];
      t.type === "key" && t.timestamp / 1e6 <= this.#t.currentTime && (this.#i = e);
    }
  };
  finish() {
    this.#b = !0;
  }
  /** Release the decoder and undisplayed frames while the filter is stopped. */
  suspend() {
    this.#s();
  }
  reset() {
    this.#s(), this.#o = [], this.#i = 0, this.#n = null, this.#b = !1, this.#w = !1;
  }
  destroy() {
    this.reset(), this.#t.removeEventListener("seeking", this.#s), this.#t.removeEventListener("ratechange", this.#s);
  }
  #a(e) {
    this.#s(), this.#w = !0, console.warn("mpeg2toh264: decoded video input unavailable", e);
  }
}
const se = [
  "mozParsedFrames",
  "mozDecodedFrames",
  "mozPresentedFrames",
  "mozPaintedFrames"
];
function re(n) {
  return se.every((e) => e in n);
}
function Me(n) {
  return n.ownerDocument?.defaultView?.performance.timeOrigin ?? performance.timeOrigin;
}
function _e() {
  return typeof HTMLVideoElement < "u" && (re(HTMLVideoElement.prototype) || typeof HTMLVideoElement.prototype.requestVideoFrameCallback == "function");
}
const Se = 250, Ce = 500;
class Pe {
  #t;
  #n;
  #e;
  #o = null;
  #i = null;
  #r = null;
  #m = null;
  #c = !0;
  #b = null;
  #E = null;
  #w = 0;
  #h;
  #A;
  #l = null;
  #u = null;
  #s = null;
  #a = null;
  #I = 0;
  #f = [];
  #p = [];
  constructor(e, t) {
    if (this.#t = e, this.#n = t, this.#e = re(e) ? e : null, this.#h = this.#e === null && typeof VideoFrame < "u", this.#A = this.#h && e.playbackRate > 1, this.#e) {
      for (const i of ["emptied", "seeking", "seeked"])
        e.addEventListener(i, this.#L);
      for (const i of ["pause", "playing", "waiting", "ratechange"])
        e.addEventListener(i, this.#O);
    }
    if (this.#h)
      for (const i of [
        "loadeddata",
        "playing",
        "pause",
        "ended",
        "seeking",
        "seeked",
        "emptied",
        "ratechange"
      ])
        e.addEventListener(i, this.#D);
  }
  /** Whether acquisition uses the captured pictures' own timestamps. */
  get captureDriven() {
    return this.#A;
  }
  request(e) {
    if (this.#i === null) {
      if (this.#i = e, this.#A) {
        this.#M();
        return;
      }
      this.#o = this.#e ? requestAnimationFrame(this.#ie) : this.#t.requestVideoFrameCallback(this.#S);
    }
  }
  cancel() {
    this.#o !== null && (this.#e ? cancelAnimationFrame(this.#o) : this.#t.cancelVideoFrameCallback(this.#o)), this.#o = null, this.#i = null, this.#l?.(), this.#l = null, this.#s !== null && this.#t.cancelVideoFrameCallback(this.#s), this.#s = null, this.#F(), this.#a = null, this.#f = [], this.#A = this.#h && this.#t.playbackRate > 1, this.#L();
  }
  destroy() {
    this.cancel();
    for (const e of ["emptied", "seeking", "seeked"])
      this.#t.removeEventListener(e, this.#L);
    for (const e of ["pause", "playing", "waiting", "ratechange"])
      this.#t.removeEventListener(e, this.#O);
    for (const e of [
      "loadeddata",
      "playing",
      "pause",
      "ended",
      "seeking",
      "seeked",
      "emptied",
      "ratechange"
    ])
      this.#t.removeEventListener(e, this.#D);
  }
  /** Deliver pending input on the rendering window's refresh, before drawing. */
  flush(e) {
    if (this.#A)
      for (this.#t.ownerDocument !== this.#u && (this.#l?.(), this.#l = null, this.#M()); this.#p.length > 0 && this.#i !== null; ) {
        const t = this.#p.shift(), i = t.frame;
        try {
          this.#U(e, {
            width: i.visibleRect?.width ?? i.codedWidth,
            height: i.visibleRect?.height ?? i.codedHeight,
            mediaTime: i.timestamp / 1e6,
            presentedFrames: t.count,
            // A picture held until this refresh is scheduled no earlier than now.
            expectedDisplayTime: Math.max(t.at, e),
            timeOrigin: performance.timeOrigin,
            frame: i
          });
        } finally {
          i.close();
        }
      }
  }
  #F() {
    for (const e of this.#p) e.frame.close();
    this.#p = [];
  }
  #D = (e) => {
    const t = this.#h && this.#t.playbackRate > 1;
    if (t !== this.#A) {
      const i = this.#i;
      this.cancel(), this.#A = t, i !== null && this.request(i);
      return;
    }
    ["seeking", "seeked", "emptied", "ratechange"].includes(e.type) && (this.#a = null, this.#f = []), this.#A && ((e.type === "pause" || e.type === "ended") && this.flush(performance.now()), this.#F(), this.#l?.(), this.#l = null, this.#i !== null && this.#M());
  };
  #M() {
    if (!this.#A || this.#l !== null || this.#i === null || (this.#t.paused || this.#t.ended) && this.#a !== null)
      return;
    this.#s === null && typeof this.#t.requestVideoFrameCallback == "function" && (this.#s = this.#t.requestVideoFrameCallback(
      this.#Le
    ));
    const e = Math.max(4, 8 / Math.max(1, this.#t.playbackRate)), t = this.#t.ownerDocument?.defaultView;
    if (this.#u = this.#t.ownerDocument, t) {
      const i = t.setTimeout(this.#K, e);
      this.#l = () => t.clearTimeout(i);
    } else {
      const i = setTimeout(this.#K, e);
      this.#l = () => clearTimeout(i);
    }
  }
  #Le = () => {
    this.#s = null, this.#l?.(), this.#l = null, this.#K();
  };
  #K = () => {
    this.#l = null;
    const e = this.#t;
    if (this.#i === null) return;
    if (e.readyState < 2 || e.seeking) {
      this.#M();
      return;
    }
    let t, i = !1;
    try {
      const s = this.#n?.();
      if (s === null) {
        this.#M();
        return;
      }
      i = s !== void 0, t = s ?? new VideoFrame(e);
    } catch (s) {
      if (!(s instanceof DOMException) || s.name !== "InvalidStateError")
        throw s;
      this.#M();
      return;
    }
    if (t.timestamp === this.#a)
      t.close();
    else {
      let s = 1;
      if (this.#a !== null) {
        const A = t.timestamp - this.#a;
        if (A > 1e3 && A < 25e4 && (this.#f.push(A), this.#f.length > 7 && this.#f.shift()), A > 0 && this.#f.length > 0) {
          const o = [...this.#f].sort((l, h) => l - h), a = o[Math.floor(o.length / 2)];
          s = Math.max(1, Math.round(A / a));
        }
      }
      this.#a = t.timestamp, this.#I += s;
      const r = performance.now() + (i ? (t.timestamp / 1e6 - e.currentTime) * 1e3 / e.playbackRate : 0);
      for (this.#p.push({ frame: t, at: r, count: this.#I }); this.#p.length > 4; ) this.#p.shift().frame.close();
    }
    this.#M();
  };
  #O = () => {
    this.#b = null, this.#E = null, this.#w = 0;
  };
  #L = () => {
    this.#r = null, this.#m = null, this.#c = !0, this.#O();
  };
  /** Native acquisition: pass the report on, with the clock it was made on. */
  #S = (e, t) => {
    this.#U(e, {
      width: t.width,
      height: t.height,
      mediaTime: t.mediaTime,
      presentedFrames: t.presentedFrames,
      expectedDisplayTime: t.expectedDisplayTime,
      timeOrigin: Me(this.#t)
    });
  };
  #U = (e, t) => {
    const i = this.#i;
    this.#o = null, this.#i = null, i?.(e, t);
  };
  #ie = (e) => {
    const t = this.#e, i = se.map((o) => t[o]);
    this.#r?.some((o, a) => i[a] < o) && this.#L(), this.#r = i;
    const s = t.mozPaintedFrames, r = !t.seeking && t.readyState >= 2 && t.videoWidth > 0 && t.videoHeight > 0, A = this.#m === null && (s > 0 || t.paused && (t.mozPresentedFrames > 0 || t.mozDecodedFrames > 0));
    if (r && (A || this.#m !== null && s !== this.#m)) {
      if (this.#b !== null && e - this.#b > Ce && (this.#O(), this.#c = !0), !t.paused && !t.ended) {
        const a = this.#E;
        if (a && e - a.at >= Se) {
          const l = s - a.frames;
          if (l > 0) {
            const h = (e - a.at) / l;
            h >= 4 && h <= 200 && (this.#w = this.#w ? this.#w + (h - this.#w) * 0.25 : h);
          }
          this.#E = null;
        }
        this.#E ??= { at: e, frames: s };
      }
      this.#b = e, this.#m = s;
      const o = this.#c;
      this.#c = !1, this.#U(e, {
        width: t.videoWidth,
        height: t.videoHeight,
        // Used only to select source scan/size metadata on the media timeline.
        // It is deliberately NOT used as the frame identity or field clock.
        mediaTime: t.currentTime,
        presentedFrames: s,
        // The counters report no display time. The poll that found the frame
        // is the best stand-in, and it was taken on this module's clock --
        // not the video node's window, which may be a different one.
        expectedDisplayTime: e,
        timeOrigin: performance.timeOrigin,
        mozTiming: { periodMs: this.#w, discontinuity: o }
      });
    } else
      this.#o = requestAnimationFrame(this.#ie);
  };
}
let ne = null;
function ke(n) {
  ne = n;
}
const H = 0.5, w = 4, G = 5, g = G + 1, V = 1e3, $ = 4, P = 200, Be = 0.25, Le = 1e3 / 60, Ie = `#version 300 es
void main() {
  // One triangle over the whole viewport, from the vertex index alone. There
  // is no geometry here worth a buffer: every pixel is the fragment shader's.
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`, Ue = 0.75, Ne = 0.1, Q = 1, Ge = 0.02, Oe = 0.1, Z = 1, ze = 4, I = 5, Xe = 4, We = {
  2: 0,
  3: 0.25,
  4: 0.5,
  5: 0.75
}, He = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform bool uFlip;
out vec4 fragColor;
void main() {
  ivec2 position = ivec2(gl_FragCoord.xy);
  if (uFlip) position.y = textureSize(uField, 0).y - 1 - position.y;
  fragColor = texelFetch(uField, position, 0);
}
`;
function et() {
  return _e() && typeof WebGL2RenderingContext < "u";
}
const Ve = {
  requestAnimationFrame: (n) => requestAnimationFrame(n),
  cancelAnimationFrame: (n) => cancelAnimationFrame(n)
};
class tt extends EventTarget {
  /** Receive fMP4 from the player and decode supplemental input only above 1.25x playback speed. */
  encodedVideo;
  #t;
  #n;
  #e;
  #o;
  #i;
  /** The pulldown detection, built only while the `film` option needs it. */
  #r = null;
  #m;
  #c;
  /** The program that copies a filtered picture onto the canvas. */
  #b;
  #E;
  #w;
  #h = [];
  /** Somewhere to filter a field into, and to read it back out of. */
  #A = [];
  /** Which output slot was written last; the next one follows round the ring. */
  #l = g - 1;
  /** The draw path currently shown on the canvas, retained for snapshots. */
  #u = null;
  /** Filtered fields waiting for their moment, oldest first. */
  #s = [];
  /** The requestAnimationFrame() loop that puts them up, which is all that draws on the canvas. */
  #a = null;
  #I = 0;
  /** Deliver captured pictures on the page's refresh during faster playback. */
  #f = null;
  /** The document the owner-change listener is on, if any. */
  #p = null;
  #F;
  /** The gap between animation frames: as near as the page gets to the screen. */
  #D = Le;
  /** Where the refresh grid fitted to the animation frames stands. (otya) */
  #M = 0;
  /** How far ahead of its animation frame the last picture shown stood. (otya) */
  #Le = 0;
  #K = 0;
  #O = 0;
  /** The last picture chained onto the schedule; a break restarts it. (otya) */
  #L = null;
  /**
   * Drop the presentation queue and restart the schedule from the clock.
   * Every schedule restart goes through here (otya nulls #lastScheduled at
   * each queue clear): the old chain's clock no longer applies, so keeping
   * it would either count a phantom resync or pop freshly queued pictures
   * as late. Restart accounting for cadence changes lives in #schedule.
   */
  #S() {
    this.#s.length = 0, this.#L = null, this.#O = 0;
  }
  /** The `<div>` this put around the element, so it can be taken away again. */
  #U = null;
  #ie;
  #N;
  #se;
  #re = 0;
  /** otya GPU pulldown path: enabled by the `film` option (see below). */
  #z;
  #_;
  /** How long a frame lasts in wall time, from what the frames themselves say. */
  #g = 0;
  /** The size of a frame as it is coded, which is what a texture holds. */
  #k = 0;
  #X = 0;
  /** Where the newest frame is. The two before it follow round the ring. */
  #B = w - 1;
  /** How many of the held frames are consecutive, up to HISTORY. */
  #y = 0;
  #be = 0;
  /** presentedFrames at the last ingested frame; pairs with #lastMediaTime. */
  #Ye = 0;
  /** A destination frame that arrived before the browser finished seeking. */
  #xe = !1;
  #T = !1;
  /** Cancels work suspended inside a synchronous owner callback. */
  #J = 0;
  #Ie = !1;
  #W = !1;
  #x = null;
  #ne = [];
  #G = !1;
  #je;
  #qe;
  #R;
  #Ae;
  #V;
  #Ke;
  #d = null;
  #v;
  #ge = !1;
  #Je = 0;
  #et = !1;
  #Ht = 0;
  #ye = !1;
  #Ue = !1;
  #oe = null;
  #Vt = 0;
  #Te = /* @__PURE__ */ new Map();
  /** Everything the next report is counted from. See DeinterlaceStats. */
  #C = {
    filtered: 0,
    missed: 0,
    degraded: 0,
    discontinuities: 0,
    resynced: 0,
    late: 0,
    queueResetted: 0
  };
  /** `presentedFrames` of the last frame the callback saw; 0 before any. */
  #Fe = 0;
  /** When the last frame the filter took arrived, to see the gaps between. */
  #Ne = 0;
  #Ge = 0;
  #$ = 0;
  #he = 0;
  #ae = 0;
  #De = 0;
  #ce = 0;
  #le;
  #Oe = [];
  #ue = [];
  #Re = 0;
  #fe = 0;
  #Me = 0;
  #de = 0;
  /** The last phase read back from the GPU, and how many frames ago it was for. */
  #_e = x;
  #me = 0;
  /** The phase of the frame being filtered: #known advanced by #knownAge. */
  #P = x;
  #Q = !1;
  #pe = null;
  #Et = "";
  /** Debug only: frames given each phase (0 for none), and repeats dropped. */
  #ze = [0, 0, 0, 0, 0, 0];
  #tt = 0;
  /**
   * Why requested film reconstruction is currently degraded, or null while
   * healthy. The `film` option stays as the caller set it;
   * only the engine stands down, so this is never a silent option change.
   */
  #ee = null;
  /** Last worker-reported filmError, to derive the page-side failure event. */
  #it = null;
  #st = 0;
  constructor(e, t = {}, i = null) {
    super(), this.#e = e, this.#N = t.doubleRate ?? !1, this.#se = t.spatialCheck ?? !0, this.#z = t.debug ?? !1, this.#_ = t.film ?? !1, this.#je = t.onStats, this.#qe = t.onFailure, this.#R = i, this.#V = i ? "main" : t.rendering ?? "main", this.#Ke = t.workerUrl ?? ne, this.#v = this.#V === "main" ? "main" : "idle", this.#n = i ? i.canvas : document.createElement("canvas"), this.#t = i?.canvas ?? (this.#V === "main" ? this.#n : document.createElement("canvas")), this.#Ae = e, i || (this.#n.style.cssText = "position:absolute;pointer-events:none;visibility:hidden");
    const s = this.#t.getContext("webgl2", {
      // Keep the underlying video in Chromium's compositor to receive frame notifications at the source rate.
      alpha: !0,
      antialias: !1,
      depth: !1,
      stencil: !1,
      preserveDrawingBuffer: !1,
      powerPreference: "high-performance"
    });
    if (!(s instanceof WebGL2RenderingContext))
      throw new Error("this browser has no WebGL2");
    this.#i = s, this.#_ && (this.#gt(), this.#r = new W(s)), this.#m = Y(s, Fe);
    const r = this.#m;
    this.#c = Object.fromEntries(
      Object.entries(Te).map(([A, o]) => [
        A,
        s.getUniformLocation(r, o)
      ])
    ), this.#b = Y(s, He), this.#E = s.getUniformLocation(this.#b, "uField"), this.#w = s.getUniformLocation(this.#b, "uFlip"), this.#le = s.getExtension(
      "EXT_disjoint_timer_query_webgl2"
    ), this.#t.addEventListener(
      "webglcontextlost",
      this.#Wt
    ), this.#ie = i ? null : new ResizeObserver(() => this.#ke()), this.#F = i ? null : new MutationObserver(() => {
      this.#n.ownerDocument !== this.#p && this.#ke();
    }), this.encodedVideo = !i && typeof VideoDecoder < "u" ? new Re(e) : null, this.#o = new Pe(e, () => this.encodedVideo?.take()), e.addEventListener("emptied", this.#Ot), e.addEventListener("resize", this.#Gt), e.addEventListener("pause", this.#q), e.addEventListener("ended", this.#q), e.addEventListener("seeking", this.#Xt), e.addEventListener("seeked", this.#q), e.addEventListener("ratechange", this.#q);
  }
  get running() {
    return this.#T && (this.#x?.interlaced ?? !0);
  }
  /** The HTML canvas currently placed over the media element. */
  get canvas() {
    return this.#n;
  }
  /** Field order for the current scan state, defaulting to top-field-first. */
  get #wt() {
    return this.#x?.topFieldFirst !== !1;
  }
  /** The same public filter options for either rendering target. */
  #bt() {
    return {
      doubleRate: this.#N,
      spatialCheck: this.#se,
      film: this.#_,
      debug: this.#z
    };
  }
  /** Whether the caller wants filtering, independently of the current source. */
  get enabled() {
    return this.#Ie;
  }
  set enabled(e) {
    this.#Ie = e, this.#rt(), this.#d?.postMessage({
      type: "enabled",
      enabled: e
    });
  }
  /** Update whether the source needs filtering and which field comes first. */
  set scan(e) {
    const t = this.#x?.interlaced !== e?.interlaced, i = t || this.#x?.topFieldFirst !== e?.topFieldFirst;
    this.#x = e, !(i && (!this.#Ee() || this.#x !== e)) && (this.#d?.postMessage({ type: "scan", scan: e }), i && (this.#y = 0, this.#S(), this.#H(), t && (this.#g = 0), this.#u = null, this.#j(!1)), this.#rt(), i && ((e?.interlaced ?? !0) && (this.#R || this.#v === "main") ? this.#Pe() : this.#lt()));
  }
  get scan() {
    return this.#x;
  }
  set videoTimeline(e) {
    this.#ne = e, this.#d?.postMessage({
      type: "timeline",
      videoTimeline: e
    }), e.length === 0 && (this.#x = null), this.#rt();
  }
  get videoTimeline() {
    return this.#ne;
  }
  /**
   * What to put on the screen for fullscreen: the `<div>` holding both the
   * element and the canvas once there is one, and the element itself before
   * that. Fullscreening the element alone would leave the canvas behind in
   * the page, and with it the only deinterlaced picture there is.
   */
  get container() {
    return this.#U ?? this.#e;
  }
  /** Whether a picture goes up for every field rather than every frame. */
  get doubleRate() {
    return this.#N;
  }
  set doubleRate(e) {
    e !== this.#N && (this.#N = e, this.#ve(), this.#S(), this.#xt());
  }
  get spatialCheck() {
    return this.#se;
  }
  set spatialCheck(e) {
    e !== this.#se && (this.#se = e, this.#ve());
  }
  get film() {
    return this.#_;
  }
  set film(e) {
    const t = this.#d ? this.#it : this.#ee;
    if (!(e === this.#_ && (e === !1 || t === null))) {
      if (this.#d) {
        this.#_ = e, this.#ve(e ? "film" : void 0);
        return;
      }
      if (e) {
        if (!this.#Ee()) return;
        try {
          this.#yt();
        } catch (i) {
          this.#_ = !0, this.#ve(), this.#At(
            `film detector unavailable: ${i instanceof Error ? i.message : String(i)}`
          );
          return;
        }
      }
      if (this.#_ = e, this.#ve(), !e) {
        if (!this.#Ee()) return;
        this.#Q = !1, this.#P = x, this.#H(), this.#r?.destroy(), this.#r = null;
      }
      this.#xt();
    }
  }
  get debug() {
    return this.#z;
  }
  set debug(e) {
    e !== this.#z && (this.#z = e, this.#ve());
  }
  /** Whether pictures are queued for presentation by the frame loop. */
  get #$t() {
    return this.#N || this.#_;
  }
  #xt() {
    this.#W || (this.#$t ? (this.#k > 0 && this.#Nt(), (this.#x?.interlaced ?? !0) && (this.#R || this.#v === "main") && this.#Pe()) : this.#_ || (this.#u = null, this.#j(!1), this.#Be()));
  }
  /** Apply mutable filter settings to the existing Worker and canvas. */
  #ve(e) {
    this.#d?.postMessage({
      type: "settings",
      options: this.#bt(),
      retryFilm: e
    });
  }
  #gt() {
    if (this.#i.getExtension("EXT_color_buffer_float") === null)
      throw new Error("film needs EXT_color_buffer_float");
  }
  /** Build the GPU pulldown detector the `film` option needs, or throw. */
  #yt() {
    this.#gt(), this.#r ??= new W(this.#i), this.#k > 0 && this.#r.resize(this.#k, this.#X);
  }
  #rt() {
    this.#Ie && (this.#ne.length > 0 || (this.#x?.interlaced ?? !0)) ? this.start() : this.stop();
  }
  /** Start the bundled Worker when the required transfer APIs are available. */
  #Qt() {
    return this.#R || this.#V === "main" ? !1 : this.#v === "starting" || this.#v === "active" ? !0 : typeof Worker < "u" && typeof VideoFrame < "u" && typeof OffscreenCanvas < "u" && this.#Ke !== null && "transferControlToOffscreen" in HTMLCanvasElement.prototype ? (this.#Tt(), !0) : this.#V === "auto" ? (this.#Xe(), !1) : (this.#v = "failed", this.#T = !1, !0);
  }
  /** Transfer the display canvas to a new Worker, replacing it if already transferred. */
  #Tt() {
    this.#Z(), this.#d?.terminate(), this.#d = null, this.#ye = !1, this.#Ue = !1, this.#it = null, this.#st = 0;
    let e = this.#n;
    if (this.#et) {
      e = document.createElement("canvas"), e.className = this.#n.className;
      const r = this.#n.getAttribute("style");
      r === null ? e.removeAttribute("style") : e.setAttribute("style", r), e.style.visibility = "hidden", this.#n.parentElement && this.#n.replaceWith(e), this.#n = e;
    }
    const t = ++this.#Je;
    this.#v = "starting";
    let i, s;
    try {
      s = e.transferControlToOffscreen(), this.#et = !0, i = new Worker(this.#Ke, { type: "module" });
    } catch (r) {
      this.#Se(
        r instanceof Error ? r.message : String(r)
      );
      return;
    }
    this.#d = i, i.onmessage = (r) => {
      t === this.#Je && this.#Zt(r.data);
    }, i.onerror = (r) => {
      t === this.#Je && (r.preventDefault(), this.#Se(r.message || "the deinterlacer worker failed"));
    }, i.postMessage(
      {
        type: "initialize",
        canvas: s,
        options: this.#bt(),
        scan: this.#x,
        videoTimeline: this.#ne,
        enabled: this.#T,
        video: this.#ot()
      },
      [s]
    );
  }
  /** Apply Worker notifications and release the wait for the next input frame. */
  #Zt(e) {
    switch (e.type) {
      case "ready":
        this.#v = "active", this.#T && (this.#Ce(), this.#Ze());
        break;
      case "failed":
        this.#Se(e.message);
        break;
      case "consumed": {
        this.#ye = !1, this.#Ue = !0;
        const t = this.#oe;
        this.#oe = null, t && this.#Dt(t);
        break;
      }
      case "visibility":
        this.#n.style.visibility = e.visible ? "visible" : "hidden";
        break;
      case "stats": {
        const t = {
          ...e.stats,
          dropped: this.#e.getVideoPlaybackQuality?.().droppedVideoFrames ?? 0
        }, i = t.filmError ?? null, s = this.#st;
        if (this.#it = i, this.#st = e.filmFailure, i !== null && e.filmFailure !== s) {
          this.dispatchEvent(
            new CustomEvent("failure", { detail: i })
          );
          try {
            this.#qe?.(i);
          } catch {
          }
        }
        this.dispatchEvent(new CustomEvent("stats", { detail: t })), this.#je?.(t);
        break;
      }
      case "capture": {
        const t = this.#Te.get(e.id);
        if (this.#Te.delete(e.id), !t) {
          e.image?.close();
          break;
        }
        e.image ? t.resolve(e.image) : createImageBitmap(this.#e).then(
          t.resolve,
          t.reject
        );
        break;
      }
    }
  }
  /**
   * Tell the owner that a rendering resource failed after construction.
   * In the worker domain the boundary counts episodes: the reason travels in
   * `stats.filmError` and the page derives the event from the episode count,
   * so a film degradation is never mistaken for worker death.
   */
  #nt(e) {
    if (this.dispatchEvent(new CustomEvent("failure", { detail: e })), !this.#R)
      try {
        this.#qe?.(e);
      } catch {
      }
  }
  /**
   * Stand down film reconstruction without touching the caller's options.
   * Pictures keep flowing through plain YADIF; the reason is reported once
   * per episode through the failure event/option and `stats.filmError`.
   * Silently turning the `film` option off is not a fallback -- it would
   * rewrite the caller's 24fps intent -- so the option stays on and only
   * the engine stands down.
   */
  #At(e) {
    this.#ee !== e && (this.#ee = e, this.#Q = !1, this.#P = x, this.#H(), this.#r?.destroy(), this.#r = null, this.#nt(e));
  }
  /**
   * Re-arm film reconstruction at a resource-reallocation point (start, scan
   * change, resize, or re-setting the option). The next frame retries; a
   * repeated failure degrades again and notifies as a new episode.
   */
  #Ee() {
    return this.#W ? !1 : (this.#d || (this.#ee = null), !0);
  }
  /** Retry a transient Worker failure once, then show the media element if it fails again. */
  #Se(e) {
    if (this.#v === "starting" && this.#V === "auto" && !this.#ge) {
      this.#Xe();
      return;
    }
    if (this.#Ft(e), !this.#ge) {
      this.#ge = !0, this.#Tt();
      return;
    }
    console.error(`Deinterlacer Worker stopped: ${e}`), this.#v = "failed", this.#d?.terminate(), this.#d = null, this.#Z(), this.#nt(`deinterlacer worker stopped: ${e}`), this.stop();
  }
  /** Restore the main-thread canvas when automatic Worker selection fails. */
  #Xe() {
    const e = this.#t;
    e.className = this.#n.className;
    const t = this.#n.getAttribute("style");
    t === null ? e.removeAttribute("style") : e.setAttribute("style", t), e.style.visibility = "hidden", this.#n.parentElement && this.#n.replaceWith(e), this.#n = e, this.#et = !1, this.#d?.terminate(), this.#d = null, this.#v = "main", this.#Z(), this.#T && (this.#Ce(), this.#Ze(), (this.#x?.interlaced ?? !0) && this.#Pe());
  }
  /** Close the queued frame still owned by the page when switching renderers. */
  #Z() {
    this.#oe?.frame.close(), this.#oe = null;
  }
  /** Reject captures whose replies would be lost when the Worker is rebuilt. */
  #Ft(e) {
    for (const t of this.#Te.values())
      t.reject(new Error(e));
    this.#Te.clear();
  }
  start() {
    if (!(this.#T || this.#W || this.#G) && (this.#J++, this.#T = !0, this.#zt(), !!this.#Ee())) {
      if (this.#ci(), this.#Ze(), this.#Qt()) {
        this.#d?.postMessage({
          type: "enabled",
          enabled: !0
        }), this.#v === "active" && this.#Ce();
        return;
      }
      this.#Ce(), (this.#x?.interlaced ?? !0) && this.#Pe();
    }
  }
  /** Take the deinterlaced picture away, leaving the element's own showing. */
  stop() {
    this.#J++, this.#T && (this.#T = !1, this.#o.cancel(), this.encodedVideo?.suspend(), this.#Ct(), this.#lt(), this.#y = 0, this.#u = null, this.#j(!1), this.#Z(), this.#d?.postMessage({
      type: "enabled",
      enabled: !1
    }));
  }
  destroy() {
    if (!this.#W) {
      this.#W = !0, this.#Ie = !1, this.stop(), this.#d?.postMessage({ type: "destroy" }), this.#d?.terminate(), this.#d = null, this.#Z(), this.#Ft("the deinterlacer was destroyed"), this.#p?.removeEventListener(
        "visibilitychange",
        this.#dt
      ), this.#p = null, this.#F?.disconnect(), this.#t.removeEventListener(
        "webglcontextlost",
        this.#Wt
      ), this.#o.destroy(), this.encodedVideo?.destroy(), this.#e.removeEventListener("emptied", this.#Ot), this.#e.removeEventListener("resize", this.#Gt), this.#e.removeEventListener("pause", this.#q), this.#e.removeEventListener("ended", this.#q), this.#e.removeEventListener("seeking", this.#Xt), this.#e.removeEventListener("seeked", this.#q), this.#e.removeEventListener("ratechange", this.#q), this.#li();
      for (const e of this.#h) this.#i.deleteTexture(e);
      this.#h = [], this.#Be();
      for (const e of [
        ...this.#Oe,
        ...this.#ue.map(({ q: t }) => t)
      ])
        this.#i.deleteQuery(e);
      this.#Oe.length = 0, this.#ue.length = 0, this.#r?.destroy(), this.#r = null, this.#pe !== null && (ue(this.#pe), this.#pe = null), this.#i.deleteProgram(this.#m), this.#i.deleteProgram(this.#b), this.#i.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }
  /**
   * Copy the picture currently represented by the deinterlacer.
   *
   * The WebGL drawing buffer is deliberately not preserved between browser
   * composites. Repeating the exact draw path of the presented picture before
   * `createImageBitmap` makes a snapshot reliable without imposing the
   * permanent cost of `preserveDrawingBuffer` on ordinary playback.
   */
  capture() {
    if (this.#v === "active" && this.#n.style.visibility === "visible" && this.#d) {
      const s = ++this.#Vt, r = new Promise((A, o) => {
        this.#Te.set(s, { resolve: A, reject: o });
      });
      return this.#d.postMessage({
        type: "capture",
        id: s,
        width: this.#e.videoWidth,
        height: this.#e.videoHeight
      }), r;
    }
    if (this.#v === "starting" || this.#v === "failed")
      return createImageBitmap(this.#e);
    const e = this.#u;
    if (this.#R && (!this.#T || this.#G || !e))
      return Promise.reject(new Error("no rendered picture is available"));
    if (!this.#T || this.#G || !e)
      return createImageBitmap(this.#e);
    e.kind === "texture" ? this.#pt(e.texture, e.flip, !1) : this.#te(e.flush, e.second, null, !1);
    const t = this.#e.videoWidth, i = this.#e.videoHeight;
    return t > 0 && i > 0 && (t !== this.#t.width || i !== this.#t.height) ? createImageBitmap(this.#t, {
      resizeWidth: t,
      resizeHeight: i,
      resizeQuality: "high"
    }) : createImageBitmap(this.#t);
  }
  addEventListener(e, t, i) {
    super.addEventListener(e, t, i);
  }
  removeEventListener(e, t, i) {
    super.removeEventListener(e, t, i);
  }
  #Ce() {
    this.#R || !this.#T || this.#o.request(this.#ti);
  }
  /** Copy the element's playback state for seek and presentation timing decisions. */
  #ot() {
    const e = [];
    for (let t = 0; t < this.#e.buffered.length; t++)
      e.push({
        start: this.#e.buffered.start(t),
        end: this.#e.buffered.end(t)
      });
    return {
      currentTime: this.#e.currentTime,
      playbackRate: this.#e.playbackRate,
      seeking: this.#e.seeking,
      paused: this.#e.paused,
      ended: this.#e.ended,
      readyState: this.#e.readyState,
      videoWidth: this.#e.videoWidth,
      videoHeight: this.#e.videoHeight,
      buffered: e
    };
  }
  /** Keep one frame in flight and the newest one waiting, staying close to the audio clock. */
  #Yt(e, t, i) {
    let s;
    try {
      s = i?.clone() ?? new VideoFrame(this.#e, {
        timestamp: Math.max(0, Math.round(t.mediaTime * 1e6))
      });
    } catch (A) {
      const o = A instanceof Error ? A.message : String(A);
      this.#V === "auto" && !this.#Ue && !this.#ge ? (this.#Xe(), this.#He(e, t)) : this.#Se(o);
      return;
    }
    const r = {
      id: ++this.#Ht,
      frame: s,
      now: e,
      metadata: t,
      video: this.#ot()
    };
    if (this.#ye) {
      this.#oe?.frame.close(), this.#oe = r;
      return;
    }
    this.#Dt(r);
  }
  /** Transfer the selected frame once the Worker has released the previous input. */
  #Dt(e) {
    const t = this.#d;
    if (!t || this.#v !== "active") {
      e.frame.close();
      return;
    }
    this.#ye = !0;
    const i = {
      type: "frame",
      id: e.id,
      frame: e.frame,
      metadata: e.metadata,
      video: e.video
    };
    try {
      t.postMessage(i, [e.frame]);
    } catch (s) {
      this.#ye = !1, e.frame.close();
      const r = s instanceof Error ? s.message : String(s);
      this.#V === "auto" && !this.#Ue && !this.#ge ? (this.#Xe(), this.#He(e.now, e.metadata)) : this.#Se(r);
    }
  }
  #jt(e, t, i) {
    this.#pe == null && (this.#pe = ce(this.#i, "20px monospace")), fe(this.#pe, e, t, i, this.#k, this.#X, 20);
  }
  #Rt(e) {
    if (this.#le == null || this.#ue.length > 30)
      return;
    const t = this.#Oe.pop() ?? this.#i.createQuery();
    return this.#i.beginQuery(this.#le.TIME_ELAPSED_EXT, t), this.#ue.push({ q: t, isField: e }), t;
  }
  #We(e) {
    this.#le != null && (e != null && this.#i.endQuery(this.#le.TIME_ELAPSED_EXT), this.#ue = this.#ue.filter(
      ({ q: t, isField: i }) => {
        if (this.#i.getQueryParameter(t, this.#i.QUERY_RESULT_AVAILABLE)) {
          const s = this.#i.getQueryParameter(t, this.#i.QUERY_RESULT);
          return i ? (this.#Me += s, this.#de++) : (this.#Re += s, this.#fe++), this.#Oe.push(t), !1;
        }
        return !0;
      }
    ));
  }
  #H() {
    this.#P = x, this.#_e = x, this.#me = 0, this.#Q = !1, this.#r?.reset();
  }
  /** Detect the pulldown phase of the frame being filtered on the GPU. */
  #qt() {
    const { prev: e, cur: t, next: i } = this.#It(!1), s = this.#h[e], r = this.#h[t], A = this.#h[i];
    if (!s || !r || !A) return;
    const o = this.#x?.topFieldFirst !== !1 ? 0 : 1;
    this.#r?.detect(r, A, o), this.#r?.measureComb(s, r, o);
  }
  /**
   * Read back the previous frame's phase if it has arrived, and advance it
   * to the frame being filtered. The run is not advanced: only the GPU
   * counts observed frames.
   */
  #Kt() {
    const e = this.#r?.poll() ?? null;
    e !== null && (this.#_e = e, this.#me = e.age), this.#me++;
    const { phase: t, run: i } = this.#_e;
    t === 0 || this.#me > Math.ceil(I * Math.max(1, this.#e.playbackRate)) ? this.#P = x : this.#P = {
      phase: (t - 1 + this.#me) % I + 1,
      run: i
    };
  }
  #Jt(e) {
    const t = [], i = this.#r?.metrics ?? new Float32Array(0);
    for (let r = 0; r < p.phase; r++) {
      const A = i[r * 4] ?? 0, o = i[r * 4 + 1] ?? 0, a = i[r * 4 + 2] ?? 0;
      t.push(
        `${A.toFixed(3)},${o.toString().padStart(4)},${a.toFixed(3)}`
      );
    }
    const s = this.#ze.map((r, A) => `${A === 0 ? "-" : A}:${r}`).join(" ");
    return `frame=${e} phase=${this.#P.phase} run=${this.#P.run} known=${this.#_e.phase}/${this.#_e.run} age=${this.#me} ${this.#Q ? "film" : "video"} period=${this.#g.toFixed(3)}
${t.join(" ")}
${s} dropped:${this.#tt}`;
  }
  /**
   * A timestamp taken on `origin`'s clock, expressed on this realm's.
   *
   * `performance.timeOrigin` is defined against the same moment in every
   * realm, so the difference between two origins is the whole of the
   * conversion between their clocks (W3C HR-Time 1.2). The origins are
   * subtracted from one another before the timestamp is added: they are the
   * large numbers, their difference is not, and doing it the other way round
   * would spend the precision the schedule is measured in.
   */
  #ht(e, t) {
    const i = t - performance.timeOrigin;
    return Number.isFinite(i) && i !== 0 ? e + i : e;
  }
  /**
   * When this frame reaches the screen, on the clock this renderer draws by.
   *
   * requestVideoFrameCallback()'s display time is what holds the schedule on
   * the refresh grid, so it is preferred wherever it is usable -- including
   * across realms, since #localTime converts it exactly. It is not always
   * usable: 0 and NaN have both been reported, an origin may be missing, and
   * a time that cannot belong to this frame is worse than no time at all.
   * Those fall back to the moment the frame was taken in hand, which is this
   * renderer's own clock and always valid.
   */
  #ei(e, t) {
    const i = e.expectedDisplayTime;
    if (!Number.isFinite(i) || i <= 0 || !Number.isFinite(e.timeOrigin)) return t;
    const s = this.#ht(i, e.timeOrigin), r = ze * Math.max(this.#D, this.#g);
    return s < t - r || s > t + r ? t : s;
  }
  #ti = (e, t) => {
    if (!this.#T || this.#G) return;
    this.#ft();
    const i = this.#ht(e, t.timeOrigin), { frame: s, ...r } = t;
    this.#Ae = s ?? this.#e;
    try {
      this.#ii(i, r, s);
    } finally {
      this.#Ae = this.#e;
    }
    this.#Ce();
  };
  /**
   * Take a frame from either acquisition path into the selected renderer.
   * `now` is the ingestion time on this realm's clock.
   */
  #ii(e, t, i) {
    if (this.#v === "active") {
      this.#Yt(e, t, i);
      return;
    }
    this.#v !== "starting" && this.#He(e, t);
  }
  /**
   * @internal Feed Worker input through the same history and rendering decisions
   * as main-thread input. `now` is the ingestion time on the Worker's clock.
   * The metadata's display time stays on the page's clock and is converted
   * using the accompanying timeOrigin.
   */
  ingestExternalFrame(e, t, i) {
    this.#Ae = i;
    try {
      this.#He(e, t);
    } finally {
      this.#Ae = this.#e;
    }
  }
  /** Take one input into the shared history and decide its YADIF or IVTC presentation. */
  #He(e, t) {
    const i = this.#J;
    if (this.#Y(i) && (this.#si(t.mediaTime), !!this.#Y(i) && t.width > 0 && t.height > 0)) {
      let s = !1;
      if (!this.#xe && this.#e.seeking) {
        const c = this.#e.buffered, m = this.#g >= $ ? this.#g / 1e3 : P / 1e3;
        for (let v = 0; v < c.length; v++)
          if (t.mediaTime >= c.start(v) && t.mediaTime < c.end(v) && Math.abs(t.mediaTime - this.#e.currentTime) <= m) {
            s = !0;
            break;
          }
      }
      if (s && (this.#xe = !0), (this.#k === 0 || this.#X === 0) && this.#Ut(t.width, t.height), !this.#Y(i)) return;
      if (this.#x && !this.#x.interlaced) {
        const c = performance.now();
        this.#kt(c), this.#Ne = c, this.#hi(), this.#he += performance.now() - c, this.#$++, this.#ae++, this.#Bt(c);
        return;
      }
      const r = t.mediaTime - this.#be, A = t.mozTiming, o = s || (A ? A.discontinuity || r < 0 || r > H : r < 0 || r > H);
      o && (this.#y = 0, this.#g = 0, this.#C.discontinuities++, this.#S(), this.#H());
      const a = this.#ai(t.presentedFrames, o);
      if (this.#y > 0 && t.mediaTime === this.#be && (!A || t.presentedFrames === this.#Ye))
        return;
      if (!o) {
        const c = A?.periodMs ?? 0;
        c > 0 ? this.#Mt(
          c * (this.#e.playbackRate || 1) / 1e3,
          1
        ) : this.#y > 0 && r > 0 && this.#Mt(r, a + 1);
      }
      this.#be = t.mediaTime, this.#Ye = t.presentedFrames;
      const l = performance.now();
      this.#kt(l), this.#Ne = l;
      const h = performance.now(), f = this.#Rt(!1);
      if (this.#Lt(), this.#_ && !this.#ee && !this.#r)
        try {
          this.#yt();
        } catch (c) {
          this.#At(
            `film detector unavailable: ${c instanceof Error ? c.message : String(c)}`
          );
        }
      if (!this.#Y(i)) {
        this.#W || this.#We(f);
        return;
      }
      if (this.#_ && !this.#ee) {
        if (this.#y === w && a === 0)
          try {
            this.#Kt(), this.#qt();
          } catch (c) {
            this.#At(
              `film detection failed: ${c instanceof Error ? c.message : String(c)}`
            );
          }
        else
          this.#H();
        this.#ze[this.#P.phase] = (this.#ze[this.#P.phase] ?? 0) + 1, this.#Q = this.#P.phase !== 0 && this.#P.run >= z, this.#z && (this.#Et = this.#Jt(t.presentedFrames));
      }
      if (!this.#Y(i)) {
        this.#W || this.#We(f);
        return;
      }
      const u = this.#ei(t, e) + this.#D;
      if (this.#Q)
        if (this.#Ve()) {
          const c = this.#P.phase;
          if (c === N)
            this.#tt++, this.#O++;
          else {
            const m = this.#g * I / Xe, v = this.#ct(1, e, m), E = We[c] ?? 0, L = v || this.#L === null ? u + m : u + E * this.#g;
            this.#$e(
              "film",
              !1,
              this.#at("film", L, m),
              m
            );
          }
        } else
          this.#te(!1, !1, null);
      else if (this.#N && this.#Ve()) {
        const c = this.#g / 2, v = this.#ct(2, e, c) || this.#L === null ? u + c * 2 : u, E = this.#at("field", v, c);
        this.#$e("field", !1, E, c), this.#$e("field", !0, E + c, c);
      } else if (this.#Ve()) {
        const c = this.#g, v = this.#ct(1, e, c) || this.#L === null ? u + c : u;
        this.#$e(
          "frame",
          !1,
          this.#at("frame", v, c),
          c
        ) || (this.#C.late++, this.#te(!1, !1, null));
      } else
        this.#C.late += this.#s.length, this.#S(), this.#te(!1, !1, null);
      this.#ce = Math.max(
        this.#ce,
        this.#s.length
      ), this.#We(f), this.#he += performance.now() - h, this.#$++, this.#Bt(l);
    }
  }
  #Y(e) {
    return !this.#W && this.#T && e === this.#J;
  }
  #si(e) {
    const t = this.#J;
    let i;
    for (let A = this.#ne.length - 1; A >= 0; A--) {
      const o = this.#ne[A];
      if (o.start <= e + 1e-6) {
        i = o;
        break;
      }
    }
    if (i?.codedSize && (i.codedSize.width !== this.#k || i.codedSize.height !== this.#X) && this.#Ut(i.codedSize.width, i.codedSize.height), !this.#Y(t)) return;
    const s = i?.scan;
    if (!s || this.#x?.interlaced === s.interlaced && this.#x.topFieldFirst === s.topFieldFirst)
      return;
    const r = this.#x?.interlaced;
    this.#x = s, this.#y = 0, this.#S(), this.#Ee() && (r !== s.interlaced && (this.#g = 0), s.interlaced && (this.#R || this.#v === "main") ? this.#Pe() : this.#lt(), this.#H());
  }
  /**
   * Whether pictures are being filtered ahead of time and queued, rather than
   * drawn as their frame arrives.
   *
   * A picture for every frame has nothing to schedule -- there is one of them
   * and it goes up now -- and neither has a filter that has yet to see two
   * frames go by, since until then there is no idea how long a frame lasts.
   */
  #Ve() {
    return (this.#N || this.#_) && this.#g > 0 && this.#A.length === g;
  }
  /**
   * How long a frame lasts in wall time, kept as a smoothed estimate.
   *
   * Taken from the frames themselves rather than from a frame rate nobody
   * reports, and in wall time, so a rate other than 1 moves the fields with
   * it. A frame the callback never saw makes the step between two of them a
   * whole multiple of the period, and dividing that back out matters: taken
   * at face value, one missed frame would put every field of the next one
   * half a frame late and hold the picture through a refresh it should have
   * moved in.
   */
  #Mt(e, t) {
    const s = e * 1e3 / (this.#e.playbackRate || 1) / t;
    s < $ || s > P || (this.#g = this.#g > 0 && s > this.#g * Ue ? this.#g + (s - this.#g) * Be : s);
  }
  /**
   * Filter one field into an output texture and put it in the queue.
   *
   * The three frames the filter reads are only the right three between one
   * frame arriving and the next, so both fields of a frame are built here and
   * held as pictures. What is queued after that is a copy waiting for a
   * moment, which no later frame can take away.
   */
  #$e(e, t, i, s) {
    const r = this.#_t();
    if (r === null) return !1;
    const A = this.#A[r];
    if (!A) return !1;
    for (this.#l = r; this.#s.length > 0 && this.#s[0]?.slot === r; )
      this.#s.shift(), this.#C.late++;
    this.#te(!1, t, A.framebuffer);
    const o = {
      slot: r,
      at: i,
      duration: s,
      cadence: e,
      phase: e === "film" ? this.#P.phase : e === "field" ? t ? 2 : 1 : 0,
      droppedBefore: this.#O
    };
    return this.#O = 0, this.#s.push(o), this.#L = o, !0;
  }
  /**
   * When a picture goes up: one duration after the last one of its cadence,
   * nudged towards `ideal` by a fraction of the gap so that the schedule
   * follows the clock without a picture ever moving across a refresh. It
   * restarts from `ideal` when the gap has grown to a whole picture or the
   * cadence has changed. (otya)
   */
  #at(e, t, i) {
    if (!(i > 0)) return t;
    const s = this.#L;
    if (s !== null && s.cadence === e) {
      const r = s.at + s.duration, A = t - r;
      if (Math.abs(A) < i) {
        const o = Math.max(
          -Q,
          Math.min(Q, A * Ne)
        );
        return r + o;
      }
    }
    s !== null && this.#C.resynced++;
    for (let r = this.#s.at(-1); r && r.at >= t; )
      this.#s.pop(), this.#C.late++, r = this.#s.at(-1);
    return t;
  }
  /** Make room without treating ordinary capacity pressure as clock divergence. */
  #ct(e, t, i) {
    const s = this.#s.at(-1), r = (G + 1) * Math.max(this.#D, i);
    if (s && s.at - t > r)
      return this.#S(), this.#C.queueResetted++, !0;
    const A = Math.max(
      0,
      this.#s.length + e - G
    );
    let o = 0, a = 0;
    for (; a < A; ) {
      const l = this.#s.shift();
      if (!l) break;
      o += l.duration, a++;
    }
    for (const l of this.#s) l.at -= o;
    return this.#C.late += a, !1;
  }
  /** Select an output whose pixels are not still represented by the canvas or queue. */
  #_t() {
    const e = this.#u?.kind === "texture" ? this.#u.texture : null, t = new Set(this.#s.map(({ slot: s }) => s));
    for (let s = 1; s <= g; s++) {
      const r = (this.#l + s) % g, A = this.#A[r];
      if (A && A.texture !== e && !t.has(r))
        return r;
    }
    const i = this.#s[0];
    if (i) {
      const s = this.#A[i.slot];
      if (s && s.texture !== e) return i.slot;
    }
    return null;
  }
  /** The loop that puts filtered fields up, and the only thing that draws. */
  #Pe() {
    this.#a === null && (!this.#T || this.#G || (this.#I = 0, this.#a = this.#we(this.#ut)));
  }
  #lt() {
    this.#Qe(this.#a), this.#a = null, this.#S();
  }
  #ut = (e) => {
    if (this.#a = null, !this.#T || this.#G) return;
    this.#ri(e);
    const t = this.#J;
    this.#o.flush(e), this.#Y(t) && (this.#v === "main" && this.#Ai(this.#M, e), this.#a = this.#we(this.#ut));
  };
  /**
   * Fit a grid of refreshes (period and phase) to the animation frames. rAF
   * timestamps wander by a millisecond or so, which is more than the
   * nearest-refresh decision in #present can take; the grid is what it
   * compares against. A frame far off the grid restarts it. (otya)
   */
  #ri(e) {
    const t = e - this.#I;
    this.#I = e;
    const i = Math.max(1, Math.round(t / this.#D)), s = this.#M + i * this.#D, r = e - s;
    if (this.#M === 0 || t <= 0 || t > P || Math.abs(r) > this.#D / 4) {
      t >= 1 && t <= P && (this.#D = t), this.#M = e;
      return;
    }
    this.#D += r / i * Ge, this.#M = s + r * Oe;
  }
  /**
   * Where animation frames come from, and the clock their timestamps carry.
   *
   * For Worker rendering it is the host the Worker entry supplied, whose
   * frames are already this realm's. Otherwise it is the window of the
   * document the canvas is in, which is the window that composites it -- and
   * which a document picture-in-picture window becomes by adopting the
   * element. The element is consulted as well, because the two move together
   * and either may be read first while a move is in progress.
   */
  #St() {
    const e = this.#R;
    if (e)
      return { frames: e, origin: performance.timeOrigin };
    const t = this.#n.ownerDocument?.defaultView ?? this.#e.ownerDocument?.defaultView ?? null;
    return t === null ? { frames: Ve, origin: performance.timeOrigin } : { frames: t, origin: t.performance.timeOrigin };
  }
  /**
   * Ask the current source for one frame, on this module's clock.
   *
   * An animation frame is timestamped against the clock of the window that
   * served it, and after an adoption that is not the clock the presentation
   * deadlines are on. The conversion belongs to the request rather than to
   * the callback: the source that was asked is the source that answers, so
   * the origin captured here is the right one however often the owner moves.
   */
  #we(e) {
    const { frames: t, origin: i } = this.#St(), s = t.requestAnimationFrame(
      (r) => e(this.#ht(r, i))
    );
    return { frames: t, handle: s };
  }
  /** Cancel a pending animation frame through the source that issued it. */
  #Qe(e) {
    e?.frames.cancelAnimationFrame(e.handle);
  }
  /**
   * Follow the window that composites the canvas.
   *
   * A request already outstanding on the previous window is not merely late.
   * A window that has gone hidden serves no animation frames at all, so
   * waiting for that callback to notice the move waits for something that
   * will not happen; and cancelling it anywhere but on that same window
   * leaves it outstanding. Every other thing still being observed -- a frame
   * arriving, a layout, the old window saying it is going away -- re-points
   * both requests instead.
   *
   * Nothing queued moves: presentation deadlines are on this module's clock,
   * which no adoption changes. Only the refresh grid starts again, because a
   * grid describes one compositor and this is a different one.
   */
  #ft() {
    if (this.#R) return;
    this.#ni();
    const { frames: e } = this.#St(), t = this.#a !== null && this.#a.frames !== e, i = this.#f !== null && this.#f.frames !== e;
    !t && !i || (this.#I = 0, t && (this.#Qe(this.#a), this.#a = this.#we(this.#ut)), i && (this.#Qe(this.#f), this.#f = this.#we(this.#mt)));
  }
  /** Watch the current document for visibility changes and DOM adoption. */
  #ni() {
    const e = this.#R ? null : this.#n.ownerDocument ?? null;
    e !== this.#p && (this.#p?.removeEventListener(
      "visibilitychange",
      this.#dt
    ), this.#p = e, e?.addEventListener("visibilitychange", this.#dt), this.#F?.disconnect(), e && this.#F?.observe(e, { childList: !0, subtree: !0 }));
  }
  #dt = () => {
    this.#W || this.#ft();
  };
  /** Deliver faster-playback captures even when a Worker owns the drawing loop. */
  #Ze() {
    this.#R || this.#f !== null || !this.#o.captureDriven || !this.#T || this.#G || (this.#f = this.#we(this.#mt));
  }
  /** Cancel the page's pending capture delivery. */
  #Ct() {
    this.#Qe(this.#f), this.#f = null;
  }
  /** Flush captured pictures on the refresh that will present them. */
  #mt = (e) => {
    if (this.#f = null, !this.#T || this.#G) return;
    const t = this.#J;
    this.#o.flush(e), this.#Y(t) && this.#o.captureDriven && (this.#f = this.#we(this.#mt));
  };
  /**
   * Put up whichever filtered field belongs on the screen next.
   *
   * What is drawn during an animation frame reaches the screen at the composite
   * after it, so that is the moment being filled, and a field goes up at
   * whichever composite falls nearest the moment it stands for -- half a
   * refresh either side of it. Where two of them have come due since the last
   * one, only the newer is shown: a screen has one picture per refresh, and
   * the older of the two is a moment the viewer should already be past.
   *
   * Near the half-refresh boundary a picture goes the way the last one went,
   * so that the slip a cadence the refresh does not divide into must make
   * every so often happens once rather than flapping.
   */
  #Ai(e, t) {
    const i = this.#D / 2, s = (a) => {
      const l = a.at - e;
      return l <= i - Z ? !0 : l > i + Z ? !1 : this.#Le > 0;
    };
    for (; this.#s[1] && s(this.#s[1]); )
      this.#C.late++, this.#s.shift();
    const r = this.#s[0];
    if (!r || !s(r)) return;
    this.#s.shift(), this.#Le = r.at - e;
    const A = performance.now(), o = this.#Rt(!0);
    this.#Pt(r.slot), this.#We(o), this.#De += performance.now() - A, this.#ae++, this.#z && this.#oi(r, t), this.#K = t;
  }
  /** Preserve upstream's opt-in presentation timing log in either renderer. */
  #oi(e, t) {
    const i = this.#K === 0 ? 0 : t - this.#K, s = i / this.#D, r = e.cadence === "film" ? `phase ${e.phase}` : e.cadence === "field" ? `field ${e.phase}` : "frame", A = e.phase === 0 ? "duplicate" : `phase ${N}`, o = e.droppedBefore > 0 ? `, ${A} dropped before it` + (e.droppedBefore > 1 ? ` (${e.droppedBefore})` : "") : "";
    console.log(
      `yadif: +${i.toFixed(2)} ms (${s.toFixed(2)} refreshes) ${e.cadence} ${r}, due ${(e.at - t).toFixed(2)} ms${o}`
    );
  }
  /** Copy one of the filtered pictures onto the canvas. */
  #Pt(e) {
    const t = this.#A[e];
    t && this.#pt(t.texture);
  }
  /** Put a progressive frame through unchanged, keeping one display surface. */
  #hi() {
    this.#Lt();
    const e = this.#h[this.#B];
    e && this.#pt(e, !0), this.#y = 0;
  }
  /** Apply visibility on the page; a Worker reports only the desired state. */
  #j(e) {
    if (this.#R) {
      this.#R.onVisibility(e);
      return;
    }
    this.#n.style.visibility = e ? "visible" : "hidden";
  }
  #pt(e, t = !1, i = !0) {
    const s = this.#i;
    s.bindFramebuffer(s.FRAMEBUFFER, null), s.useProgram(this.#b), s.activeTexture(s.TEXTURE0), s.bindTexture(s.TEXTURE_2D, e), s.uniform1i(this.#E, 0), s.uniform1i(this.#w, t ? 1 : 0), s.viewport(0, 0, this.#k, this.#X), s.drawArrays(s.TRIANGLES, 0, 3), this.#u = { kind: "texture", texture: e, flip: t }, this.#j(!0), i && this.#re++;
  }
  /**
   * Account for the frames between this one and the last one seen.
   *
   * There is no event for a frame the callback was not run for; the only sign
   * of one is that the count of frames the compositor has taken went up by
   * more than one. Frames thrown away either side of a discontinuity are not
   * counted: the held frames were being dropped anyway, and a seek presents
   * what it passes over.
   *
   * Returns how many frames were missed between the last one and this one.
   */
  #ai(e, t) {
    let i = 0;
    return this.#Fe !== 0 && !t && (i = Math.max(0, e - this.#Fe - 1), this.#C.missed += i), this.#Fe = e, i;
  }
  /**
   * Frames stopped arriving for a while -- a pause, a stall, a tab in the
   * background -- and a rate averaged over time nothing was asked of the
   * filter says nothing about it. Begin the interval at this frame.
   */
  #kt(e) {
    e - this.#Ne <= V || (this.#Ge = e, this.#$ = 0, this.#he = 0, this.#ae = 0, this.#De = 0, this.#ce = 0, this.#re = 0, this.#Re = 0, this.#fe = 0, this.#Me = 0, this.#de = 0);
  }
  #Bt(e) {
    const t = e - this.#Ge;
    if (t < V) return;
    const i = this.#Ve() && (this.#N || this.#Q) ? this.#ae : this.#$, s = this.#$ ? (this.#he + this.#De) / this.#$ : 0;
    let r;
    this.#le != null && (r = 0, this.#fe !== 0 && (r += this.#Re / 1e6 / this.#fe), this.#de !== 0 && (r += this.#Me / 1e6 / this.#de / 2));
    const A = {
      ...this.#C,
      // The element's own count of what its decoder could not keep up with,
      // which is the machine being behind rather than this filter.
      dropped: this.#e.getVideoPlaybackQuality?.().droppedVideoFrames ?? 0,
      fps: i * 1e3 / t,
      frameMs: s,
      maxQueuedFields: this.#ce,
      outputFps: this.#re * 1e3 / t,
      gpuMs: r,
      film: this.#Q,
      filmError: this.#ee
    };
    this.dispatchEvent(new CustomEvent("stats", { detail: A })), this.#je?.(A), this.#Ge = e, this.#$ = 0, this.#he = 0, this.#ae = 0, this.#De = 0, this.#ce = 0, this.#re = 0, this.#Re = 0, this.#fe = 0, this.#Me = 0, this.#de = 0;
  }
  /** Take the newest frame into the ring. */
  #Lt() {
    const e = this.#i;
    this.#B = (this.#B + 1) % w, e.bindTexture(e.TEXTURE_2D, this.#h[this.#B] ?? null), e.texImage2D(
      e.TEXTURE_2D,
      0,
      e.RGBA,
      e.RGBA,
      e.UNSIGNED_BYTE,
      this.#Ae
    ), this.#y = Math.min(this.#y + 1, w);
  }
  /**
   * Filter one frame, onto the canvas or into an output texture.
   *
   * A null `target` is the canvas itself, which is where the picture goes when
   * there is one per frame and nothing to schedule. An output framebuffer is a
   * field being kept for its moment.
   *
   * `second` asks for the frame's other field: the same three frames filtered
   * the other way round, keeping the field that came second and rebuilding
   * the first. The shader takes the pair of frames the missing line sits
   * between from the parity, so this is the whole of it.
   *
   * With `film` on, the shader is also given the field metrics, and puts a
   * film frame back together rather than filtering it.
   */
  #te(e, t, i, s = !0) {
    if (this.#y === 0 || this.#G) return;
    s && (this.#y === w && !e ? this.#C.filtered++ : this.#C.degraded++);
    const r = this.#i, { prev: A, cur: o, next: a } = this.#It(e);
    r.bindFramebuffer(r.FRAMEBUFFER, i), r.useProgram(this.#m);
    for (const [u, c] of [A, o, a].entries())
      r.activeTexture(r.TEXTURE0 + u), r.bindTexture(r.TEXTURE_2D, this.#h[c] ?? null);
    r.uniform1i(this.#c.prev, 0), r.uniform1i(this.#c.cur, 1), r.uniform1i(this.#c.next, 2);
    const l = this.#_ ? this.#r?.texture ?? null : null, h = this.#_ ? this.#r?.combTexture ?? null : null, f = l !== null && h !== null;
    l !== null && h !== null && (r.activeTexture(r.TEXTURE0 + 3), r.bindTexture(r.TEXTURE_2D, l), r.uniform1i(this.#c.fieldMetrics, 3), r.activeTexture(r.TEXTURE0 + 4), r.bindTexture(r.TEXTURE_2D, h), r.uniform1i(this.#c.comb, 4)), r.uniform2i(this.#c.size, this.#k, this.#X);
    const d = this.#wt ? 0 : 1;
    r.uniform1i(this.#c.parity, t ? 1 - d : d), r.uniform1i(this.#c.tff, this.#wt ? 1 : 0), r.uniform1i(this.#c.second, t ? 1 : 0), r.uniform1i(this.#c.spatialCheck, this.#se ? 1 : 0), r.uniform1i(this.#c.debug, this.#z ? 1 : 0), r.uniform1i(this.#c.film, f ? 1 : 0), r.uniform1i(this.#c.phase, this.#P.phase), r.viewport(0, 0, this.#k, this.#X), r.drawArrays(r.TRIANGLES, 0, 3), this.#z && f && this.#jt(this.#Et, 0, 90), i === null && (this.#u = { kind: "yadif", flush: e, second: t }, this.#j(!0), s && this.#re++);
  }
  #It(e) {
    const t = (i) => (this.#B + w - i) % w;
    return this.#y === 1 ? { prev: this.#B, cur: this.#B, next: this.#B } : e ? { prev: t(1), cur: this.#B, next: this.#B } : this.#y === 2 ? { prev: t(1), cur: t(1), next: this.#B } : { prev: t(2), cur: t(1), next: this.#B };
  }
  /**
   * Put the canvas exactly where the element's picture is.
   *
   * The buffer holds coded pixels and is stretched across a box of the shape
   * the picture is meant to be seen in, which is what applies the sample
   * aspect ratio -- the same stretch the element does with its own picture.
   * The box itself is the picture's, not the element's: a media element fits
   * its picture inside its box and this has to land on top of that, so the fit
   * is worked out again here. It assumes the element's `object-fit` is the
   * `contain` it is by default.
   */
  #ke() {
    if (this.#ft(), !this.#U) return;
    const e = this.#e, t = e.videoWidth, i = e.videoHeight;
    if (t === 0 || i === 0) return;
    const s = Math.min(
      e.offsetWidth / t,
      e.offsetHeight / i
    ), r = t * s, A = i * s;
    this.#n.style.left = `${e.offsetLeft + (e.offsetWidth - r) / 2}px`, this.#n.style.top = `${e.offsetTop + (e.offsetHeight - A) / 2}px`, this.#n.style.width = `${r}px`, this.#n.style.height = `${A}px`;
  }
  #Ut(e, t) {
    const i = this.#i;
    this.#t.width = e, this.#t.height = t, this.#k = e, this.#X = t, this.#y = 0, this.#u = null, this.#S(), this.#ke();
    for (const s of this.#h) i.deleteTexture(s);
    this.#h = [];
    for (let s = 0; s < w; s++) {
      const r = i.createTexture();
      i.bindTexture(i.TEXTURE_2D, r), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texImage2D(
        i.TEXTURE_2D,
        0,
        i.RGBA,
        e,
        t,
        0,
        i.RGBA,
        i.UNSIGNED_BYTE,
        null
      ), this.#h.push(r);
    }
    this.#Be(), (this.#N || this.#_) && this.#Nt(), this.#r?.resize(e, t), this.#Ee();
  }
  /**
   * Somewhere to keep a filtered field until its moment comes.
   *
   * A frame's worth of texture each, so they exist only while a picture is
   * being shown for every field. Where a framebuffer will not take one -- an
   * implementation that will not render to RGBA8, or memory it will not find
   * -- the whole lot goes and the fields are drawn as their frames arrive,
   * which is the timing this replaces but is still a picture.
   */
  #Nt() {
    const e = this.#i;
    if (!(this.#A.length === g || this.#k === 0)) {
      this.#Be();
      for (let t = 0; t < g; t++) {
        const i = e.createTexture();
        e.bindTexture(e.TEXTURE_2D, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texImage2D(
          e.TEXTURE_2D,
          0,
          e.RGBA,
          this.#k,
          this.#X,
          0,
          e.RGBA,
          e.UNSIGNED_BYTE,
          null
        );
        const s = e.createFramebuffer();
        e.bindFramebuffer(e.FRAMEBUFFER, s), e.framebufferTexture2D(
          e.FRAMEBUFFER,
          e.COLOR_ATTACHMENT0,
          e.TEXTURE_2D,
          i,
          0
        );
        const r = e.checkFramebufferStatus(e.FRAMEBUFFER) === e.FRAMEBUFFER_COMPLETE;
        if (e.bindFramebuffer(e.FRAMEBUFFER, null), !r) {
          e.deleteFramebuffer(s), e.deleteTexture(i), this.#Be();
          return;
        }
        this.#A.push({ texture: i, framebuffer: s });
      }
      this.#l = g - 1;
    }
  }
  #Be() {
    const e = this.#i, t = this.#u?.kind === "texture" ? this.#u.texture : null;
    this.#A.some((i) => i.texture === t) && (this.#u = null);
    for (const { texture: i, framebuffer: s } of this.#A)
      e.deleteFramebuffer(s), e.deleteTexture(i);
    this.#A = [], this.#S();
  }
  /**
   * Wrap the element in a `<div>` of this one's own and put the canvas over
   * it. The wrapper is what the canvas is positioned against; moving the
   * element out of the tree and back within the one task leaves playback
   * alone, which is what makes turning this on mid-stream free.
   */
  #ci() {
    if (this.#U) return;
    const e = this.#e.parentElement;
    if (!e) return;
    const t = document.createElement("div");
    t.style.cssText = "position:relative;display:inline-block;line-height:0;max-width:100%", e.insertBefore(t, this.#e), t.appendChild(this.#e), t.appendChild(this.#n), this.#U = t, this.#ie?.observe(this.#e), this.#ke();
  }
  #li() {
    if (this.#R) return;
    const e = this.#U;
    this.#U = null, this.#ie?.disconnect(), this.#n.remove(), e?.parentElement && (e.parentElement.insertBefore(this.#e, e), e.remove());
  }
  #Gt = () => this.#ke();
  /** Forward a media event with the page's playback state that gives it meaning. */
  #vt(e) {
    return !this.#d || this.#v === "main" ? !1 : (this.#d.postMessage({
      type: "event",
      name: e,
      video: this.#ot()
    }), !0);
  }
  #Ot = () => {
    if (this.#vt("emptied")) {
      this.#Z(), this.#j(!1);
      return;
    }
    this.#y = 0, this.#be = 0, this.#Ye = 0, this.#S(), this.#H(), this.#g = 0, this.#zt(), this.#u = null, this.#j(!1);
  };
  #zt() {
    this.#C = {
      filtered: 0,
      missed: 0,
      degraded: 0,
      discontinuities: 0,
      resynced: 0,
      late: 0,
      queueResetted: 0
    }, this.#ze.fill(0), this.#tt = 0, this.#Fe = 0, this.#Ge = 0, this.#Ne = 0, this.#$ = 0, this.#he = 0, this.#ae = 0, this.#De = 0, this.#ce = 0, this.#re = 0, this.#S(), this.#Re = 0, this.#fe = 0, this.#Me = 0, this.#de = 0;
  }
  /**
   * A new seek invalidates any destination frame remembered for the last one.
   */
  #Xt = () => {
    if (this.#vt("seeking")) {
      this.#Z();
      return;
    }
    this.#xe = !1;
  };
  /**
   * Playback stopped, so the frame being held back goes up now. One picture,
   * whatever the rate: a still frame stands for a moment, and the moment is
   * the one the first field was taken at.
   */
  #q = (e) => {
    if (e.type === "ratechange" && (this.#o.captureDriven ? this.#Ze() : this.#Ct()), (e.type === "pause" || e.type === "ended" || e.type === "seeked" || e.type === "ratechange") && this.#vt(e.type)) {
      this.#Z();
      return;
    }
    if (e.type === "seeked") {
      const i = this.#xe;
      if (this.#xe = !1, i) return;
      this.#y = 0, this.#S(), this.#H(), this.#u = null, this.#j(!1);
      return;
    }
    const t = e.type === "ratechange";
    if (t && (this.#g = 0, this.#be = this.#e.currentTime), this.#S(), this.#T && this.#y > 0) {
      const i = this.#_t(), s = i === null ? void 0 : this.#A[i];
      i !== null && s ? (this.#l = i, this.#te(!0, !1, s.framebuffer), this.#Pt(i)) : this.#te(!0, !1, null);
    }
    t && (this.#y = 0, this.#Fe = 0, this.#H());
  };
  /**
   * A lost context takes the textures and the program with it. Rebuilding
   * them is possible, but a page that has lost its context has bigger
   * problems; getting out of the way leaves the element's own picture showing.
   */
  #Wt = (e) => {
    if (e.preventDefault(), this.#R) {
      this.#R.onFailure("the deinterlacer WebGL context was lost");
      return;
    }
    this.#v !== "active" && (this.#G = !0, this.#nt("the deinterlacer WebGL context was lost"), this.stop());
  };
}
function Y(n, e) {
  const t = n.createProgram(), i = j(n, n.VERTEX_SHADER, Ie), s = j(n, n.FRAGMENT_SHADER, e);
  if (n.attachShader(t, i), n.attachShader(t, s), n.linkProgram(t), n.deleteShader(i), n.deleteShader(s), !n.getProgramParameter(t, n.LINK_STATUS)) {
    const r = n.getProgramInfoLog(t);
    throw n.deleteProgram(t), new Error(
      `the deinterlacer failed to link: ${r ?? "no reason given"}`
    );
  }
  return t;
}
function j(n, e, t) {
  const i = n.createShader(e);
  if (!i) throw new Error("the deinterlacer could not create a shader");
  if (n.shaderSource(i, t), n.compileShader(i), !n.getShaderParameter(i, n.COMPILE_STATUS)) {
    const s = n.getShaderInfoLog(i);
    throw n.deleteShader(i), new Error(
      `the deinterlacer failed to compile: ${s ?? "no reason given"}`
    );
  }
  return i;
}
const q = "data:video/mp4;base64,AAAAHGZ0eXBpc281AAACAGlzbzVpc282bXA0MQAAAu9tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAAAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAB8nRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAFoAAABDgAAAAAAY5tZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAHUwAAAAAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE5bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+XN0YmwAAACtc3RzZAAAAAAAAAABAAAAnWF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAFoAQ4AEgAAABIAAAAAAAAAAEVTGF2YzYxLjE5LjEwMSBsaWJ4MjY0AAAAAAAAAAAAAAAY//8AAAA3YXZjQwFkACn/4QAZZ2QAKazZQFoET94CIAAAfSAAHUwD4sWywAEAB2j5KBLLIsD9+PgAAAAAEHBhc3AAAAABAAAAAQAAABBzdHRzAAAAAAAAAAAAAAAQc3RzYwAAAAAAAAAAAAAAFHN0c3oAAAAAAAAAAAAAAAAAAAAQc3RjbwAAAAAAAAAAAAAAKG12ZXgAAAAgdHJleAAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAGF1ZHRhAAAAWW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALGlsc3QAAAAkqXRvbwAAABxkYXRhAAAAAQAAAABMYXZmNjEuNy4xMDAAAACYbW9vZgAAABBtZmhkAAAAAAAAAAEAAACAdHJhZgAAABx0ZmhkAAIAOAAAAAEAAAPpAAAEJwEBAAAAAAAUdGZkdAEAAAAAAAAAAAAAAAAAAEh0cnVuAAAKBQAAAAYAAACgAgAAAAAABCcAAAfSAAAAQgAAE40AAAA/AAAH0gAAAgAAAAAAAAAARAAAA+kAAAG7AAAH0gAACK9tZGF0AAACrwYF//+r3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTQgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDEzMyBtZT11bWggc3VibWU9MTAgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0yNCBjaHJvbWFfbWU9MSB0cmVsbGlzPTIgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0xNSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9dGZmIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTIgYl9iaWFzPTAgZGlyZWN0PTMgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0wIGtleWludD0zMCBrZXlpbnRfbWluPTMgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0zMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTguMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAAUGAQEygAAAAWdliIICAj/+/76ivgU3edyfbbnP6kzu1BfFPXa9rMu/FCi/GMk76JT20AAAAwAAAwAAAwAAAwAAAwAAAwEJmrWZnq7KhXxVTgAAAwAAAwAAAwAABJ9gAAADAAAKtgAAAwAAAwCi4AAAAwAAHQgAAAMAAAiqAAADAAADA7EAAAMAAAMCCgAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAL+QAAAAUGAQEygAAAADVBmiIWQj/51kP//f3t2AAPsAAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAS8AAAAAUGAQEygAAAADJBnkETiEf/hv/80gAJcAAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAkIQAAAAUGAQEygAAAAfMBnmCTRCP/9ZJR/1zH/6vL5qeSOTmASFdQlObW+4YAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAxvEAAAAwAAAwAAAwAAE4wAAAMAAAMAAAMAAFuAAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAMuAAAAABQYBATKAAAAANwGeYZakI//1bXH/Een/+rAALngAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAN+EAAAAFBgEBMoAAAAGuQZpileloiEf/2XyP/Fn/6mXyw21/v4X7ly3FFO60AAADAAADAAADAAADAAADAAADAAADADKWVJAQiFeS9HQZhFSJuVc/HAAAAwAAAwAAAwAAAwAAAwAAAwAAj8AAAAMAAAMABTIAAAMAAAMAAD+QAAADAAADAAQkAAADAAADAABJgAAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAXUQAAAENtZnJhAAAAK3RmcmEBAAAAAAAAAQAAAAAAAAABAAAAAAAAB9IAAAAAAAADCwEBAQAAABBtZnJvAAAAAAAAAEM=", $e = 0.5, Qe = 3e3, K = 0.1, F = 16, J = 'video/mp4; codecs="avc1.640029"';
let O = null;
function Ze(n = {}) {
  return O ??= Ye(n), O;
}
async function it(n = {}) {
  return (await Ze(n)).deinterlaces;
}
function st() {
  O = null;
}
async function Ye(n) {
  const e = n.tolerance ?? $e, t = n.timeoutMs ?? Qe, i = performance.now(), s = (o) => ({
    deinterlaces: !1,
    survives: null,
    tookMs: performance.now() - i,
    error: o instanceof Error ? o.message : String(o)
  });
  if (typeof document > "u")
    return s(new Error("there is no document to decode in"));
  const r = document.createElement("video");
  r.muted = !0, r.defaultMuted = !0, r.playsInline = !0, r.preload = "auto";
  let A = null;
  try {
    A = qe(r, t);
    const o = B(k(r, "loadeddata"), t), a = r.play().then(
      () => !0,
      () => !1
    );
    if (await A.ready, await o, await Ke(r, t, await a), r.videoWidth === 0 || r.videoHeight === 0)
      return s(new Error("the probe clip decoded to nothing"));
    const l = Je(r);
    return {
      deinterlaces: l < 1 - e,
      survives: l,
      tookMs: performance.now() - i
    };
  } catch (o) {
    return s(o);
  } finally {
    r.pause(), r.removeAttribute("src"), r.replaceChildren(), r.load(), A && URL.revokeObjectURL(A.url);
  }
}
const U = typeof MediaSource > "u" ? globalThis.ManagedMediaSource : MediaSource, je = typeof MediaSource > "u";
function qe(n, e) {
  if (!U || !U.isTypeSupported(J))
    throw new Error("the probe clip needs Media Source Extensions");
  const t = q.indexOf(","), i = atob(q.slice(t + 1)), s = new Uint8Array(i.length);
  for (let a = 0; a < i.length; a++) s[a] = i.charCodeAt(a);
  const r = new U(), A = URL.createObjectURL(r);
  if (je) {
    n.disableRemotePlayback = !0;
    const a = document.createElement("source");
    a.type = "video/mp4", a.src = A, n.append(a), n.load();
  } else
    n.src = A;
  const o = (async () => {
    await B(k(r, "sourceopen"), e);
    const a = r.addSourceBuffer(J), l = B(k(a, "updateend"), e);
    a.appendBuffer(s), await l, r.endOfStream();
  })();
  return { url: A, ready: o };
}
async function Ke(n, e, t) {
  if (t) {
    const i = performance.now();
    for (; n.currentTime < K && performance.now() - i < e; )
      await new Promise((s) => requestAnimationFrame(s));
    n.pause();
  } else
    n.currentTime = K, await B(k(n, "seeked"), e);
}
function Je(n) {
  const e = n.videoHeight, t = document.createElement("canvas");
  t.width = F, t.height = e;
  const i = t.getContext("2d", { willReadFrequently: !0 });
  if (!i) throw new Error("there is no 2d context to read the clip with");
  i.imageSmoothingEnabled = !1, i.drawImage(n, 0, 0, F, e);
  const s = i.getImageData(0, 0, F, e).data, r = (h) => {
    let f = 0;
    for (let d = 0; d < F; d++)
      f += s[(h * F + d) * 4 + 1] ?? 0;
    return f / F;
  };
  let A = 0;
  const o = 2, a = e - 3;
  let l = r(o);
  for (let h = o + 1; h <= a; h++) {
    const f = r(h);
    A += Math.abs(f - l), l = f;
  }
  return A / (a - o) / 255;
}
function k(n, e) {
  return new Promise((t, i) => {
    n.addEventListener(e, () => t(), { once: !0 }), n.addEventListener(
      "error",
      () => {
        const s = n instanceof HTMLMediaElement ? n.error : null, r = s ? ` (MediaError ${s.code}${s.message ? `: ${s.message}` : ""})` : "";
        i(new Error(`the probe clip ${e} failed${r}`));
      },
      { once: !0 }
    );
  });
}
function B(n, e) {
  return Promise.race([
    n,
    new Promise(
      (t, i) => setTimeout(
        () => i(new Error("the probe clip took too long")),
        e
      )
    )
  ]);
}
ke(oe);
export {
  tt as Deinterlacer,
  Fe as YADIF_FRAGMENT_SHADER,
  Te as YADIF_UNIFORMS,
  it as decoderDeinterlaces,
  st as forgetDecoderProbe,
  Ze as probeDecoder,
  et as supportsDeinterlace
};
//# sourceMappingURL=index.js.map
