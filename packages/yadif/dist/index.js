const Ae = "" + new URL("assets/worker-DwwLLXah.js", import.meta.url).href, S = `#version 300 es
void main() {
  // From the vertex index alone. There is no geometry here worth a buffer.
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;
function R(n, e, t) {
  const i = n.createProgram(), s = X(n, n.VERTEX_SHADER, t), r = X(n, n.FRAGMENT_SHADER, e);
  if (n.attachShader(i, s), n.attachShader(i, r), n.linkProgram(i), n.deleteShader(s), n.deleteShader(r), !n.getProgramParameter(i, n.LINK_STATUS)) {
    const o = n.getProgramInfoLog(i);
    throw n.deleteProgram(i), new Error(
      `the deinterlacer failed to link: ${o ?? "no reason given"}`
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
function le(n, e) {
  const t = R(n, he, ae), i = n.getAttribLocation(t, "aVertexPosition"), s = n.getAttribLocation(t, "aTextureCoord"), r = n.getUniformLocation(t, "uTexture"), o = n.getUniformLocation(t, "uMatrix"), A = n.getUniformLocation(t, "uUvMatrix"), a = n.getUniformLocation(t, "uTextColor"), l = n.getUniformLocation(t, "uBackColor");
  if (r == null || o == null || A == null || a == null || l == null)
    throw new Error(
      "failed to initialize DEBUG_FRAGMENT_SHADER, DEBUG_VERTEX_SHADER"
    );
  const h = n.createBuffer(), f = n.createBuffer();
  return {
    gl: n,
    ...ce(n, e),
    program: t,
    programUniforms: {
      vertex: i,
      textureCoord: s,
      texture: r,
      matrix: o,
      uvMatrix: A,
      textColor: a,
      backColor: l
    },
    positionBuffer: h,
    textureBuffer: f
  };
}
function ce(n, e) {
  const t = new OffscreenCanvas(0, 0), i = t.getContext("2d"), s = /* @__PURE__ */ new Map();
  let r = 0;
  const o = 0;
  let A = 1;
  i.font = e, i.fillStyle = "white";
  for (let l = 32; l < 128; l++) {
    const h = String.fromCharCode(l), f = i.measureText(h), d = Math.ceil(
      f.actualBoundingBoxDescent + f.actualBoundingBoxAscent + 1
    ), u = Math.ceil(
      f.actualBoundingBoxLeft + f.actualBoundingBoxRight + 1
    );
    s.set(h, {
      x: r,
      y: o,
      width: u,
      height: d,
      metrics: f
    }), A = Math.max(A, d), r += u;
  }
  t.width = r, t.height = A, i.font = e, i.fillStyle = "white";
  for (const [l, h] of s)
    i.fillText(
      l,
      Math.floor(h.x + h.metrics.actualBoundingBoxLeft + 1),
      Math.floor(h.metrics.actualBoundingBoxAscent + 1)
    );
  const a = n.createTexture();
  return n.bindTexture(n.TEXTURE_2D, a), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.LINEAR), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, t), { fontTexture: a, chars: s, textureSize: { width: r, height: A } };
}
function ue(n) {
  const e = n.gl;
  e.deleteBuffer(n.positionBuffer), e.deleteBuffer(n.textureBuffer), e.deleteTexture(n.fontTexture), e.deleteProgram(n.program);
}
function fe(n, e, t, i, s, r, o) {
  const A = [], a = [], l = t;
  for (const d of e) {
    if (d === `
`) {
      t = l, i += o;
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
    A.push(c, m), a.push(u.x, u.y), A.push(c, E), a.push(u.x, u.y + u.height), A.push(c + u.width, E), a.push(u.x + u.width, u.y + u.height), A.push(v, E), a.push(u.x + u.width, u.y + u.height), A.push(c, m), a.push(u.x, u.y), A.push(v, m), a.push(u.x + u.width, u.y), t += u.metrics.width;
  }
  const h = n.gl;
  h.useProgram(n.program), h.bindBuffer(h.ARRAY_BUFFER, n.positionBuffer), h.bufferData(h.ARRAY_BUFFER, new Float32Array(A), h.STATIC_DRAW), h.vertexAttribPointer(
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
  ])), h.viewport(0, 0, s, r), h.enable(h.BLEND), h.blendFunc(h.SRC_ALPHA, h.ONE_MINUS_SRC_ALPHA), h.drawArrays(h.TRIANGLES, 0, A.length / 2), h.disable(h.BLEND);
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
  #s;
  #r;
  #p;
  #u;
  #b;
  /** The block comparisons of both fields, and the same folded most of the way. */
  #w = null;
  #y = null;
  /** Combed pixels per block of the frame being filtered, both ways of weaving it. */
  #A = null;
  /** The field metrics (see FIELD_METRICS) of this frame and the one before. */
  #h = null;
  /** Which of the two holds the newest metrics. */
  #c = 0;
  /** The metrics being read back asynchronously. */
  #a = null;
  #i = null;
  #d = 0;
  #C = 0;
  /** The last metrics read back, laid out as FIELD_METRICS says. */
  metrics = new Float32Array(b * 4);
  #l = 0;
  #x = 0;
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
    ), this.#s = C(
      e,
      this.#o,
      ve
    ), this.#r = R(
      e,
      be,
      S
    ), this.#p = C(e, this.#r, we), this.#u = R(e, ye, S), this.#b = C(e, this.#u, ge);
  }
  /** The newest measurements, or null before any frame has been measured. */
  get texture() {
    return this.#h?.[this.#c]?.textures[0] ?? null;
  }
  /**
   * Combed pixels per block of the frame last measured by `measureComb`, or
   * null before one has been. See COMB_FRAGMENT_SHADER.
   */
  get combTexture() {
    return this.#A?.textures[0] ?? null;
  }
  /** The size of the frames to be measured, which sizes the block grid. */
  resize(e, t) {
    e === this.#l && t === this.#x || (this.#l = e, this.#x = t, this.#T());
  }
  /** Forget every measurement: the next frame starts a cycle from nothing. */
  reset() {
    const e = this.#t;
    e.deleteSync(this.#i), this.#i = null, this.#d = 0;
    const t = this.#h?.[this.#c];
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
    if (this.#l === 0 || this.#x === 0) return;
    this.#L();
    const r = this.#w, o = this.#y, A = this.#h;
    if (r === null || o === null || A === null) return;
    const a = A[this.#c], l = A[1 - this.#c];
    if (s.bindFramebuffer(s.FRAMEBUFFER, r.framebuffer), s.useProgram(this.#n), this.#f(0, e, this.#e.a), this.#f(1, t, this.#e.b), this.#f(2, a.textures[0], this.#e.fieldMetrics), s.uniform1i(this.#e.first, i), s.uniform2i(this.#e.size, this.#l, this.#x), s.viewport(0, 0, r.width, r.height), s.drawArrays(s.TRIANGLES, 0, 3), s.bindFramebuffer(s.FRAMEBUFFER, o.framebuffer), s.useProgram(this.#o), this.#f(0, r.textures[0], this.#s.second), this.#f(1, r.textures[1], this.#s.first), s.uniform2i(this.#s.size, r.width, r.height), s.viewport(0, 0, o.width, o.height), s.drawArrays(s.TRIANGLES, 0, 3), s.bindFramebuffer(s.FRAMEBUFFER, l.framebuffer), s.useProgram(this.#r), this.#f(0, a.textures[0], this.#p.previous), this.#f(1, o.textures[0], this.#p.second), this.#f(2, o.textures[1], this.#p.first), s.uniform2i(this.#p.size, o.width, o.height), s.viewport(0, 0, b, 1), s.drawArrays(s.TRIANGLES, 0, 3), this.#c = 1 - this.#c, this.#d++, this.#i !== null) {
      s.bindFramebuffer(s.FRAMEBUFFER, null);
      return;
    }
    this.#C = this.#d, s.bindBuffer(s.PIXEL_PACK_BUFFER, this.#a), s.readPixels(0, 0, b, 1, s.RGBA, s.FLOAT, 0), s.bindBuffer(s.PIXEL_PACK_BUFFER, null), s.bindFramebuffer(s.FRAMEBUFFER, null), this.#i = s.fenceSync(s.SYNC_GPU_COMMANDS_COMPLETE, 0), s.flush();
  }
  /**
   * Count the combing each way of weaving `cur`, the frame being filtered,
   * would leave: as it stands, and with `prev`'s second field. `first` is the
   * parity of the field that was captured first.
   */
  measureComb(e, t, i) {
    const s = this.#t;
    if (this.#l === 0 || this.#x === 0) return;
    this.#L();
    const r = this.#A;
    r !== null && (s.bindFramebuffer(s.FRAMEBUFFER, r.framebuffer), s.useProgram(this.#u), this.#f(0, e, this.#b.prev), this.#f(1, t, this.#b.cur), s.uniform1i(this.#b.first, i), s.uniform2i(this.#b.size, this.#l, this.#x), s.viewport(0, 0, r.width, r.height), s.drawArrays(s.TRIANGLES, 0, 3), s.bindFramebuffer(s.FRAMEBUFFER, null));
  }
  /**
   * The phase of the last frame measured, once the GPU has handed it back,
   * and null while it is still on its way. It is handed back once.
   */
  poll() {
    const e = this.#t, t = this.#i;
    if (t === null || this.#a === null) return null;
    switch (e.clientWaitSync(t, 0, 0)) {
      case e.ALREADY_SIGNALED:
      case e.CONDITION_SATISFIED:
        return e.bindBuffer(e.PIXEL_PACK_BUFFER, this.#a), e.getBufferSubData(e.PIXEL_PACK_BUFFER, 0, this.metrics), e.bindBuffer(e.PIXEL_PACK_BUFFER, null), e.deleteSync(t), this.#i = null, {
          phase: this.metrics[p.phase * 4] ?? 0,
          run: this.metrics[p.phase * 4 + 1] ?? 0,
          age: this.#d - this.#C
        };
      default:
        return null;
    }
  }
  destroy() {
    const e = this.#t;
    if (this.#T(), this.#h !== null) {
      for (const t of this.#h) M(e, t);
      this.#h = null;
    }
    e.deleteSync(this.#i), this.#i = null, e.deleteBuffer(this.#a), this.#a = null, e.deleteProgram(this.#n), e.deleteProgram(this.#o), e.deleteProgram(this.#r), e.deleteProgram(this.#u);
  }
  #f(e, t, i) {
    const s = this.#t;
    s.activeTexture(s.TEXTURE0 + e), s.bindTexture(s.TEXTURE_2D, t ?? null), s.uniform1i(i, e);
  }
  #T() {
    const e = this.#t;
    this.#w !== null && M(e, this.#w), this.#y !== null && M(e, this.#y), this.#A !== null && M(e, this.#A), this.#w = null, this.#y = null, this.#A = null;
  }
  /** Everything detect needs that is not there yet. */
  #L() {
    const e = this.#t;
    if (this.#w === null || this.#y === null || this.#A === null) {
      this.#T();
      const t = Math.ceil(this.#l / te), i = Math.ceil(this.#x / (ie * 2));
      this.#w = D(e, t, i, 2), this.#y = D(
        e,
        Math.ceil(t / _),
        Math.ceil(i / _),
        2
      ), this.#A = D(
        e,
        Math.ceil(this.#l / T),
        Math.ceil(this.#x / T),
        1
      );
    }
    this.#h === null && (this.#h = [
      D(e, b, 1, 1),
      D(e, b, 1, 1)
    ], this.#c = 0, this.reset()), this.#a === null && (this.#a = e.createBuffer(), e.bindBuffer(e.PIXEL_PACK_BUFFER, this.#a), e.bufferData(
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
  const o = n.checkFramebufferStatus(n.FRAMEBUFFER) === n.FRAMEBUFFER_COMPLETE;
  n.bindFramebuffer(n.FRAMEBUFFER, null);
  const A = { framebuffer: s, textures: r, width: e, height: t };
  if (!o)
    throw M(n, A), new Error("failed to allocate framebuffer");
  return A;
}
function M(n, { framebuffer: e, textures: t }) {
  n.deleteFramebuffer(e);
  for (const i of t) n.deleteTexture(i);
}
function y(n, e = 0, t = n.length) {
  const i = new DataView(n.buffer, n.byteOffset, n.byteLength), s = [];
  for (let r = e; r < t; ) {
    if (r + 8 > t) throw new Error("Incomplete MP4 box");
    const o = i.getUint32(r);
    if (o < 8 || r + o > t) throw new Error("Invalid MP4 box size");
    s.push({
      type: String.fromCharCode(...n.subarray(r + 4, r + 8)),
      start: r,
      body: r + 8,
      end: r + o
    }), r += o;
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
        (o) => o.type === s
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
        const o = n.slice(r.body, r.end);
        return { codec: "avc1." + Array.from(o.subarray(1, 4)).map((a) => a.toString(16).padStart(2, "0")).join(""), description: o };
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
  #s = 0;
  #r = null;
  #p = [];
  /** Timestamps of one-tick duplicate pictures needed only as open-GOP decoding references. */
  #u = /* @__PURE__ */ new Set();
  #b = !1;
  #w = !1;
  #y = !1;
  #A = !1;
  #h = !1;
  #c = /* @__PURE__ */ new WeakMap();
  constructor(e) {
    this.#t = e, e.addEventListener("seeking", this.#i), e.addEventListener("ratechange", this.#i);
  }
  get active() {
    return this.#A;
  }
  /** Receive input in MSE append order; the caller retains ownership of the original ArrayBuffer. */
  append(e) {
    if (this.#y) return;
    const t = new Uint8Array(e), i = new DataView(e);
    try {
      for (const r of y(t)) {
        if (r.type === "moov") {
          this.#n = De(t, r);
          const o = this.#n;
          o && VideoDecoder.isConfigSupported(o).then((A) => {
            this.#c.set(o, A.supported === !0);
          }).catch((A) => this.#d(A));
        }
        if (!(r.type !== "moof" || this.#n === null))
          for (const o of y(t, r.body, r.end).filter(
            (A) => A.type === "traf"
          )) {
            const A = y(t, o.body, o.end), a = A.find((c) => c.type === "tfhd");
            if (!a || i.getUint32(a.body + 4) !== 1) continue;
            const l = A.find((c) => c.type === "tfdt"), h = A.find((c) => c.type === "trun");
            if (!l || !h || i.getUint32(l.body) !== 16777216 || i.getUint32(h.body) !== 16781057)
              throw new Error("Unexpected mpeg2toh264 video fragment layout");
            let f = Number(i.getBigUint64(l.body + 4)), d = r.start + i.getInt32(h.body + 8);
            const u = i.getUint32(h.body + 4);
            if (h.body + 12 + u * 16 > h.end)
              throw new Error("Incomplete video samples");
            for (let c = 0; c < u; c++) {
              const m = h.body + 12 + c * 16, v = i.getUint32(m), E = i.getUint32(m + 4), L = i.getUint32(m + 8), oe = i.getInt32(m + 12);
              if (d < 0 || d + E > t.length)
                throw new Error("Video sample outside fragment");
              this.#o.push({
                config: this.#n,
                decodeTime: f / 9e4,
                timestamp: Math.round((f + oe) * 1e6 / 9e4),
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
        for (let o = 0; o < (this.#A ? this.#s : this.#o.length); o++) {
          const A = this.#o[o];
          A.type === "key" && A.timestamp / 1e6 <= s.start(0) && (r = o);
        }
        r > 0 && (this.#o.splice(0, r), this.#s = Math.max(0, this.#s - r));
      }
    } catch (s) {
      this.#d(s);
    }
  }
  /** Return undefined to use the video element, or null to wait for the next decoded frame. */
  take() {
    if (this.#y || this.#t.playbackRate <= 1.25 || this.#n === null || this.#c.get(this.#n) !== !0) {
      this.#A && this.#i();
      return;
    }
    this.#A || (this.#i(), this.#A = !0);
    const e = this.#t.currentTime;
    try {
      for (; this.#s < this.#o.length && (this.#r?.decodeQueueSize ?? 0) < 6 && this.#p.length < 12; ) {
        const i = this.#o[this.#s];
        if (i.decodeTime > e + 0.25) break;
        if (this.#e !== i.config) {
          if (this.#r) {
            if (!this.#w) {
              this.#w = !0;
              const r = this.#r;
              r.flush().then(() => {
                this.#r === r && (r.close(), this.#r = null, this.#e = null, this.#w = !1);
              }).catch((o) => {
                this.#r === r && this.#d(o);
              });
            }
            break;
          }
          const s = new VideoDecoder({
            output: (r) => {
              this.#r !== s ? r.close() : this.#a(r);
            },
            error: (r) => {
              this.#r === s && this.#d(r);
            }
          });
          this.#r = s, this.#r.configure(i.config), this.#e = i.config;
        }
        (i.duration ?? 0) < 1e3 && this.#u.add(i.timestamp), this.#r.decode(new EncodedVideoChunk(i)), this.#s++;
      }
      if (this.#b && this.#s === this.#o.length && this.#r && !this.#w) {
        this.#w = !0;
        const i = this.#r;
        i.flush().catch((s) => {
          this.#r === i && this.#d(s);
        });
      }
    } catch (i) {
      this.#d(i);
      return;
    }
    const t = this.#p[0];
    return !t || t.timestamp / 1e6 > e + 3e-3 * this.#t.playbackRate ? this.#h ? null : void 0 : (this.#h = !0, this.#p.shift());
  }
  #a = (e) => {
    this.#u.delete(e.timestamp) || e.timestamp / 1e6 < this.#t.currentTime - (this.#h ? 0.1 : 0.04) ? e.close() : this.#p.push(e);
  };
  #i = () => {
    this.#r && this.#r.state !== "closed" && this.#r.close(), this.#r = null, this.#e = null;
    for (const e of this.#p) e.close();
    this.#p = [], this.#u.clear(), this.#w = !1, this.#A = !1, this.#h = !1, this.#s = 0;
    for (let e = 0; e < this.#o.length; e++) {
      const t = this.#o[e];
      t.type === "key" && t.timestamp / 1e6 <= this.#t.currentTime && (this.#s = e);
    }
  };
  finish() {
    this.#b = !0;
  }
  /** Release the decoder and undisplayed frames while the filter is stopped. */
  suspend() {
    this.#i();
  }
  reset() {
    this.#i(), this.#o = [], this.#s = 0, this.#n = null, this.#b = !1, this.#y = !1;
  }
  destroy() {
    this.reset(), this.#t.removeEventListener("seeking", this.#i), this.#t.removeEventListener("ratechange", this.#i);
  }
  #d(e) {
    this.#i(), this.#y = !0, console.warn("mpeg2toh264: decoded video input unavailable", e);
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
class ke {
  #t;
  #n;
  #e;
  #o = null;
  #s = null;
  #r = null;
  #p = null;
  #u = !1;
  #b = !0;
  #w = null;
  #y = null;
  #A = 0;
  #h;
  #c;
  #a = !1;
  #i = null;
  #d = null;
  #C = null;
  #l = null;
  #x = 0;
  #f = [];
  #T = !1;
  #L = 0;
  #ne = [];
  #N = [];
  constructor(e, t) {
    if (this.#t = e, this.#n = t, this.#e = re(e) ? e : null, this.#h = this.#e === null && typeof VideoFrame < "u", this.#c = this.#h && e.playbackRate > 1, this.#e) {
      for (const i of ["emptied", "seeking", "seeked"])
        e.addEventListener(i, this.#G);
      for (const i of ["pause", "playing", "waiting", "ratechange"])
        e.addEventListener(i, this.#S);
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
        e.addEventListener(i, this.#z);
  }
  /** Whether acquisition runs off the Firefox counters. */
  get mozDriven() {
    return this.#e !== null && !this.#c;
  }
  /** 実画像のタイムスタンプでフレームを取得しているか */
  get captureDriven() {
    return this.#c;
  }
  /** Whether any frame has been delivered yet (counters proven live). */
  get hasDelivered() {
    return this.#u;
  }
  request(e) {
    if (this.#s === null) {
      if (this.#s = e, this.#c) {
        this.#v();
        return;
      }
      this.#o = this.#e ? requestAnimationFrame(this.#F) : this.#t.requestVideoFrameCallback(this.#X);
    }
  }
  /** 通知停止後も、倍速再生と同じ画像取得経路で再生中のフレームを届ける */
  recover() {
    this.#s === null || this.#c || this.#e || (this.#o !== null && this.#t.cancelVideoFrameCallback(this.#o), this.#o = null, this.#h ? (this.#a = !0, this.#c = !0, this.#v()) : this.#o = this.#t.requestVideoFrameCallback(this.#X));
  }
  cancel() {
    this.#o !== null && (this.#e ? cancelAnimationFrame(this.#o) : this.#t.cancelVideoFrameCallback(this.#o)), this.#o = null, this.#s = null, this.#i?.(), this.#i = null, this.#C !== null && this.#t.cancelVideoFrameCallback(this.#C), this.#C = null, this.#ee(), this.#l = null, this.#f = [], this.#a = !1, this.#c = this.#h && this.#t.playbackRate > 1, this.#G();
  }
  destroy() {
    this.cancel();
    for (const e of ["emptied", "seeking", "seeked"])
      this.#t.removeEventListener(e, this.#G);
    for (const e of ["pause", "playing", "waiting", "ratechange"])
      this.#t.removeEventListener(e, this.#S);
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
      this.#t.removeEventListener(e, this.#z);
  }
  /** Deliver pending input on the rendering window's refresh, before drawing. */
  flush(e) {
    if (this.#c)
      for (this.#t.ownerDocument !== this.#d && (this.#i?.(), this.#i = null, this.#v()); this.#N.length > 0 && this.#s !== null; ) {
        const t = this.#N.shift(), i = t.frame;
        try {
          this.#B(e, {
            width: i.visibleRect?.width ?? i.codedWidth,
            height: i.visibleRect?.height ?? i.codedHeight,
            mediaTime: i.timestamp / 1e6,
            presentedFrames: t.count,
            // 描画機会まで保持した画像は、この更新以降に表示する時刻として扱う
            expectedDisplayTime: Math.max(t.at, e),
            timeOrigin: performance.timeOrigin,
            frame: i,
            pixels: t.pixels
          });
        } finally {
          i.close(), this.#s !== null && t.pixels?.data.byteLength && this.#ne.push(t.pixels.data);
        }
      }
  }
  #ee() {
    this.#L++;
    for (const e of this.#N) e.frame.close();
    this.#N = [], this.#ne = [];
  }
  #z = (e) => {
    e.type === "emptied" && (this.#a = !1);
    const t = this.#h && (this.#t.playbackRate > 1 || this.#a);
    if (t !== this.#c) {
      const i = this.#s;
      this.cancel(), this.#c = t, i !== null && this.request(i);
      return;
    }
    ["seeking", "seeked", "emptied", "ratechange"].includes(e.type) && (this.#l = null, this.#f = []), this.#c && ((e.type === "pause" || e.type === "ended") && this.flush(performance.now()), this.#ee(), this.#i?.(), this.#i = null, this.#s !== null && this.#v());
  };
  #v() {
    if (this.#i !== null || this.#s === null || this.#T || (this.#t.paused || this.#t.ended) && this.#l !== null)
      return;
    this.#C === null && typeof this.#t.requestVideoFrameCallback == "function" && (this.#C = this.#t.requestVideoFrameCallback(
      this.#Q
    ));
    const e = Math.max(4, 8 / Math.max(1, this.#t.playbackRate)), t = this.#t.ownerDocument?.defaultView;
    if (this.#d = this.#t.ownerDocument, t) {
      const i = t.setTimeout(this.#te, e);
      this.#i = () => t.clearTimeout(i);
    } else {
      const i = setTimeout(this.#te, e);
      this.#i = () => clearTimeout(i);
    }
  }
  #Q = () => {
    this.#C = null, this.#i?.(), this.#i = null, this.#te();
  };
  #te = async () => {
    this.#i = null;
    const e = this.#t;
    if (this.#s === null || this.#T) return;
    if (e.readyState < 2 || e.seeking) {
      this.#v();
      return;
    }
    let t, i = !1;
    try {
      const s = this.#n?.();
      if (s === null) {
        this.#v();
        return;
      }
      i = s !== void 0, t = s ?? new VideoFrame(e);
    } catch (s) {
      if (!(s instanceof DOMException) || s.name !== "InvalidStateError")
        throw s;
      this.#v();
      return;
    }
    if (t.timestamp === this.#l)
      t.close();
    else {
      let s;
      if (this.#a) {
        const A = this.#L, a = t.visibleRect?.width ?? t.codedWidth, l = t.visibleRect?.height ?? t.codedHeight;
        let h = this.#ne.pop();
        h?.byteLength !== a * l * 4 && (h = new Uint8ClampedArray(a * l * 4)), this.#T = !0;
        try {
          await t.copyTo(h, { format: "RGBA" }), s = new ImageData(h, a, l);
        } catch (f) {
          throw t.close(), f;
        } finally {
          this.#T = !1;
        }
        if (A !== this.#L || this.#s === null) {
          t.close(), this.#v();
          return;
        }
      }
      let r = 1;
      if (this.#l !== null) {
        const A = t.timestamp - this.#l;
        if (A > 1e3 && A < 25e4 && (this.#f.push(A), this.#f.length > 7 && this.#f.shift()), A > 0 && this.#f.length > 0) {
          const a = [...this.#f].sort((h, f) => h - f), l = a[Math.floor(a.length / 2)];
          r = Math.max(1, Math.round(A / l));
        }
      }
      this.#l = t.timestamp, this.#x += r;
      const o = performance.now() + (i ? (t.timestamp / 1e6 - e.currentTime) * 1e3 / e.playbackRate : 0);
      for (this.#N.push({ frame: t, pixels: s, at: o, count: this.#x }); this.#N.length > 4; ) this.#N.shift().frame.close();
    }
    this.#v();
  };
  #S = () => {
    this.#w = null, this.#y = null, this.#A = 0;
  };
  #G = () => {
    this.#r = null, this.#p = null, this.#b = !0, this.#S();
  };
  /** Native acquisition: pass the report on, with the clock it was made on. */
  #X = (e, t) => {
    const i = Math.round(t.mediaTime * 1e6);
    if (this.#l !== null) {
      const s = t.presentedFrames - this.#x, r = i - this.#l;
      s > 0 && r > 1e3 && r < 25e4 && (this.#f.push(r / s), this.#f.length > 7 && this.#f.shift());
    }
    this.#l = i, this.#x = t.presentedFrames, this.#B(e, {
      width: t.width,
      height: t.height,
      mediaTime: t.mediaTime,
      presentedFrames: t.presentedFrames,
      expectedDisplayTime: t.expectedDisplayTime,
      timeOrigin: Me(this.#t)
    });
  };
  #B = (e, t) => {
    const i = this.#s;
    this.#o = null, this.#s = null, this.#u = !0, i?.(e, t);
  };
  #F = (e) => {
    const t = this.#e, i = se.map((A) => t[A]);
    this.#r?.some((A, a) => i[a] < A) && this.#G(), this.#r = i;
    const s = t.mozPaintedFrames, r = !t.seeking && t.readyState >= 2 && t.videoWidth > 0 && t.videoHeight > 0, o = this.#p === null && (s > 0 || t.paused && (t.mozPresentedFrames > 0 || t.mozDecodedFrames > 0));
    if (r && (o || this.#p !== null && s !== this.#p)) {
      if (this.#w !== null && e - this.#w > Ce && (this.#S(), this.#b = !0), !t.paused && !t.ended) {
        const a = this.#y;
        if (a && e - a.at >= Se) {
          const l = s - a.frames;
          if (l > 0) {
            const h = (e - a.at) / l;
            h >= 4 && h <= 200 && (this.#A = this.#A ? this.#A + (h - this.#A) * 0.25 : h);
          }
          this.#y = null;
        }
        this.#y ??= { at: e, frames: s };
      }
      this.#w = e, this.#p = s;
      const A = this.#b;
      this.#b = !1, this.#B(e, {
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
        mozTiming: { periodMs: this.#A, discontinuity: A }
      });
    } else
      this.#o = requestAnimationFrame(this.#F);
  };
}
let ne = null;
function Pe(n) {
  ne = n;
}
const H = 0.5, w = 4, G = 5, g = G + 1, V = 1e3, $ = 4, k = 200, Be = 0.25, Le = 1e3 / 60, Ie = 250, Ue = `#version 300 es
void main() {
  // One triangle over the whole viewport, from the vertex index alone. There
  // is no geometry here worth a buffer: every pixel is the fragment shader's.
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`, Ne = 0.75, Ge = 0.1, Q = 1, Oe = 0.02, ze = 0.1, Z = 1, Xe = 4, I = 5, We = 4, He = {
  2: 0,
  3: 0.25,
  4: 0.5,
  5: 0.75
}, Ve = `#version 300 es
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
function tt() {
  return _e() && typeof WebGL2RenderingContext < "u";
}
const $e = {
  requestAnimationFrame: (n) => requestAnimationFrame(n),
  cancelAnimationFrame: (n) => cancelAnimationFrame(n)
};
class it extends EventTarget {
  /** Receive fMP4 from the player and decode supplemental input only above 1.25x playback speed. */
  encodedVideo;
  #t;
  #n;
  #e;
  #o;
  #s;
  /** The pulldown detection, built only while the `film` option needs it. */
  #r = null;
  #p;
  #u;
  /** The program that copies a filtered picture onto the canvas. */
  #b;
  #w;
  #y;
  #A = [];
  /** Somewhere to filter a field into, and to read it back out of. */
  #h = [];
  /** Which output slot was written last; the next one follows round the ring. */
  #c = g - 1;
  /** The draw path currently shown on the canvas, retained for snapshots. */
  #a = null;
  /** Filtered fields waiting for their moment, oldest first. */
  #i = [];
  /** The requestAnimationFrame() loop that puts them up, which is all that draws on the canvas. */
  #d = null;
  #C = 0;
  /** ページ側で frame callback の停止を監視する requestAnimationFrame()。 */
  #l = null;
  /** The document the owner-change listener is on, if any. */
  #x = null;
  #f;
  /** The gap between animation frames: as near as the page gets to the screen. */
  #T = Le;
  /** Where the refresh grid fitted to the animation frames stands. (otya) */
  #L = 0;
  /** How far ahead of its animation frame the last picture shown stood. (otya) */
  #ne = 0;
  #N = 0;
  #ee = 0;
  /** The last picture chained onto the schedule; a break restarts it. (otya) */
  #z = null;
  /**
   * Drop the presentation queue and restart the schedule from the clock.
   * Every schedule restart goes through here (otya nulls #lastScheduled at
   * each queue clear): the old chain's clock no longer applies, so keeping
   * it would either count a phantom resync or pop freshly queued pictures
   * as late. Restart accounting for cadence changes lives in #schedule.
   */
  #v() {
    this.#i.length = 0, this.#z = null, this.#ee = 0;
  }
  /** The `<div>` this put around the element, so it can be taken away again. */
  #Q = null;
  #te;
  #S;
  #G;
  #X = 0;
  /** otya GPU pulldown path: enabled by the `film` option (see below). */
  #B;
  #F;
  /** How long a frame lasts in wall time, from what the frames themselves say. */
  #D = 0;
  /** The size of a frame as it is coded, which is what a texture holds. */
  #I = 0;
  #W = 0;
  /** Where the newest frame is. The two before it follow round the ring. */
  #U = w - 1;
  /** How many of the held frames are consecutive, up to HISTORY. */
  #R = 0;
  #ge = 0;
  /** presentedFrames at the last ingested frame; pairs with #lastMediaTime. */
  #Ze = 0;
  /** A destination frame that arrived before the browser finished seeking. */
  #ye = !1;
  /** 画像取得経路から最後にフレームを受け取った時刻 */
  #Ye = 0;
  #M = !1;
  /** Cancels work suspended inside a synchronous owner callback. */
  #ie = 0;
  #Ie = !1;
  #H = !1;
  #g = null;
  #oe = [];
  #O = !1;
  #je;
  #qe;
  #_;
  #Ae;
  #Z;
  #Ke;
  #m = null;
  #E;
  #Te = !1;
  #Je = 0;
  #et = !1;
  #Ht = 0;
  #Fe = !1;
  #Ue = !1;
  #he = null;
  #Vt = 0;
  #De = /* @__PURE__ */ new Map();
  /** Everything the next report is counted from. See DeinterlaceStats. */
  #k = {
    filtered: 0,
    missed: 0,
    degraded: 0,
    discontinuities: 0,
    resynced: 0,
    late: 0,
    queueResetted: 0
  };
  /** `presentedFrames` of the last frame the callback saw; 0 before any. */
  #Re = 0;
  /** When the last frame the filter took arrived, to see the gaps between. */
  #Ne = 0;
  #Ge = 0;
  #Y = 0;
  #ae = 0;
  #le = 0;
  #Me = 0;
  #ce = 0;
  #ue;
  #Oe = [];
  #fe = [];
  #_e = 0;
  #de = 0;
  #Se = 0;
  #me = 0;
  /** The last phase read back from the GPU, and how many frames ago it was for. */
  #Ce = x;
  #pe = 0;
  /** The phase of the frame being filtered: #known advanced by #knownAge. */
  #P = x;
  #j = !1;
  #ve = null;
  #wt = "";
  /** Debug only: frames given each phase (0 for none), and repeats dropped. */
  #ze = [0, 0, 0, 0, 0, 0];
  #tt = 0;
  /**
   * Why requested film reconstruction is currently degraded, or null while
   * healthy. The `film` option stays as the caller set it;
   * only the engine stands down, so this is never a silent option change.
   */
  #se = null;
  /** Last worker-reported filmError, to derive the page-side failure event. */
  #it = null;
  #st = 0;
  constructor(e, t = {}, i = null) {
    super(), this.#e = e, this.#S = t.doubleRate ?? !1, this.#G = t.spatialCheck ?? !0, this.#B = t.debug ?? !1, this.#F = t.film ?? !1, this.#je = t.onStats, this.#qe = t.onFailure, this.#_ = i, this.#Z = i ? "main" : t.rendering ?? "main", this.#Ke = t.workerUrl ?? ne, this.#E = this.#Z === "main" ? "main" : "idle", this.#n = i ? i.canvas : document.createElement("canvas"), this.#t = i?.canvas ?? (this.#Z === "main" ? this.#n : document.createElement("canvas")), this.#Ae = e, i || (this.#n.style.cssText = "position:absolute;pointer-events:none;visibility:hidden");
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
    this.#s = s, this.#F && (this.#yt(), this.#r = new W(s)), this.#p = Y(s, Fe);
    const r = this.#p;
    this.#u = Object.fromEntries(
      Object.entries(Te).map(([o, A]) => [
        o,
        s.getUniformLocation(r, A)
      ])
    ), this.#b = Y(s, Ve), this.#w = s.getUniformLocation(this.#b, "uField"), this.#y = s.getUniformLocation(this.#b, "uFlip"), this.#ue = s.getExtension(
      "EXT_disjoint_timer_query_webgl2"
    ), this.#t.addEventListener(
      "webglcontextlost",
      this.#Wt
    ), this.#te = i ? null : new ResizeObserver(() => this.#Be()), this.#f = i ? null : new MutationObserver(() => {
      this.#n.ownerDocument !== this.#x && this.#Be();
    }), this.encodedVideo = !i && typeof VideoDecoder < "u" ? new Re(e) : null, this.#o = new ke(e, () => this.encodedVideo?.take()), e.addEventListener("emptied", this.#Ot), e.addEventListener("resize", this.#Gt), e.addEventListener("pause", this.#J), e.addEventListener("ended", this.#J), e.addEventListener("seeking", this.#Xt), e.addEventListener("seeked", this.#J), e.addEventListener("ratechange", this.#J);
  }
  get running() {
    return this.#M && (this.#g?.interlaced ?? !0);
  }
  /** 現在 media element の上に配置している HTML canvas。 */
  get canvas() {
    return this.#n;
  }
  /** Field order for the current scan state, defaulting to top-field-first. */
  get #bt() {
    return this.#g?.topFieldFirst !== !1;
  }
  /** どの描画先にも同じ公開オプションを渡す。 */
  #xt() {
    return {
      doubleRate: this.#S,
      spatialCheck: this.#G,
      film: this.#F,
      debug: this.#B
    };
  }
  /** Whether the caller wants filtering, independently of the current source. */
  get enabled() {
    return this.#Ie;
  }
  set enabled(e) {
    this.#Ie = e, this.#rt(), this.#m?.postMessage({
      type: "enabled",
      enabled: e
    });
  }
  /** Update whether the source needs filtering and which field comes first. */
  set scan(e) {
    const t = this.#g?.interlaced !== e?.interlaced, i = t || this.#g?.topFieldFirst !== e?.topFieldFirst;
    this.#g = e, !(i && (!this.#we() || this.#g !== e)) && (this.#m?.postMessage({ type: "scan", scan: e }), i && (this.#R = 0, this.#v(), this.#V(), t && (this.#D = 0), this.#a = null, this.#K(!1)), this.#rt(), i && ((e?.interlaced ?? !0) && (this.#_ || this.#E === "main") ? this.#Pe() : this.#ct()));
  }
  get scan() {
    return this.#g;
  }
  set videoTimeline(e) {
    this.#oe = e, this.#m?.postMessage({
      type: "timeline",
      videoTimeline: e
    }), e.length === 0 && (this.#g = null), this.#rt();
  }
  get videoTimeline() {
    return this.#oe;
  }
  /**
   * What to put on the screen for fullscreen: the `<div>` holding both the
   * element and the canvas once there is one, and the element itself before
   * that. Fullscreening the element alone would leave the canvas behind in
   * the page, and with it the only deinterlaced picture there is.
   */
  get container() {
    return this.#Q ?? this.#e;
  }
  /** Whether a picture goes up for every field rather than every frame. */
  get doubleRate() {
    return this.#S;
  }
  set doubleRate(e) {
    e !== this.#S && (this.#S = e, this.#Ee(), this.#v(), this.#gt());
  }
  get spatialCheck() {
    return this.#G;
  }
  set spatialCheck(e) {
    e !== this.#G && (this.#G = e, this.#Ee());
  }
  get film() {
    return this.#F;
  }
  set film(e) {
    const t = this.#m ? this.#it : this.#se;
    if (!(e === this.#F && (e === !1 || t === null))) {
      if (this.#m) {
        this.#F = e, this.#Ee(e ? "film" : void 0);
        return;
      }
      if (e) {
        if (!this.#we()) return;
        try {
          this.#Tt();
        } catch (i) {
          this.#F = !0, this.#Ee(), this.#ot(
            `film detector unavailable: ${i instanceof Error ? i.message : String(i)}`
          );
          return;
        }
      }
      if (this.#F = e, this.#Ee(), !e) {
        if (!this.#we()) return;
        this.#j = !1, this.#P = x, this.#V(), this.#r?.destroy(), this.#r = null;
      }
      this.#gt();
    }
  }
  get debug() {
    return this.#B;
  }
  set debug(e) {
    e !== this.#B && (this.#B = e, this.#Ee());
  }
  /** Whether pictures are queued for presentation by the frame loop. */
  get #$t() {
    return this.#S || this.#F;
  }
  #gt() {
    this.#H || (this.#$t ? (this.#I > 0 && this.#Nt(), (this.#g?.interlaced ?? !0) && (this.#_ || this.#E === "main") && this.#Pe()) : this.#F || (this.#a = null, this.#K(!1), this.#Le()));
  }
  /** Worker と canvas を再構築せずに変更可能なフィルター設定を反映する。 */
  #Ee(e) {
    this.#m?.postMessage({
      type: "settings",
      options: this.#xt(),
      retryFilm: e
    });
  }
  #yt() {
    if (this.#s.getExtension("EXT_color_buffer_float") === null)
      throw new Error("film needs EXT_color_buffer_float");
  }
  /** Build the GPU pulldown detector the `film` option needs, or throw. */
  #Tt() {
    this.#yt(), this.#r ??= new W(this.#s), this.#I > 0 && this.#r.resize(this.#I, this.#W);
  }
  #rt() {
    this.#Ie && (this.#oe.length > 0 || (this.#g?.interlaced ?? !0)) ? this.start() : this.stop();
  }
  /** 転送に必要な API がそろっている場合だけ同梱 Worker を起動する。 */
  #Qt() {
    return this.#_ || this.#Z === "main" ? !1 : this.#E === "starting" || this.#E === "active" ? !0 : typeof Worker < "u" && typeof VideoFrame < "u" && typeof OffscreenCanvas < "u" && this.#Ke !== null && "transferControlToOffscreen" in HTMLCanvasElement.prototype ? (this.#Ft(), !0) : this.#Z === "auto" ? (this.#Xe(), !1) : (this.#E = "failed", this.#M = !1, !0);
  }
  /** 表示中の canvas を置き換えてから、新しい canvas の制御を Worker へ移す。 */
  #Ft() {
    this.#q(), this.#m?.terminate(), this.#m = null, this.#Fe = !1, this.#Ue = !1, this.#it = null, this.#st = 0;
    let e = this.#n;
    if (this.#et) {
      e = document.createElement("canvas"), e.className = this.#n.className;
      const r = this.#n.getAttribute("style");
      r === null ? e.removeAttribute("style") : e.setAttribute("style", r), e.style.visibility = "hidden", this.#n.parentElement && this.#n.replaceWith(e), this.#n = e;
    }
    const t = ++this.#Je;
    this.#E = "starting";
    let i, s;
    try {
      s = e.transferControlToOffscreen(), this.#et = !0, i = new Worker(this.#Ke, { type: "module" });
    } catch (r) {
      this.#ke(
        r instanceof Error ? r.message : String(r)
      );
      return;
    }
    this.#m = i, i.onmessage = (r) => {
      t === this.#Je && this.#Zt(r.data);
    }, i.onerror = (r) => {
      t === this.#Je && (r.preventDefault(), this.#ke(r.message || "the deinterlacer worker failed"));
    }, i.postMessage(
      {
        type: "initialize",
        canvas: s,
        options: this.#xt(),
        scan: this.#g,
        videoTimeline: this.#oe,
        enabled: this.#M,
        video: this.#At()
      },
      [s]
    );
  }
  /** Worker の通知を反映し、入力を1枚ずつ送るための待機を解除する。 */
  #Zt(e) {
    switch (e.type) {
      case "ready":
        this.#E = "active", this.#M && (this.#be(), this.#mt());
        break;
      case "failed":
        this.#ke(e.message);
        break;
      case "consumed": {
        this.#Fe = !1, this.#Ue = !0;
        const t = this.#he;
        this.#he = null, t && this.#Rt(t);
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
        const t = this.#De.get(e.id);
        if (this.#De.delete(e.id), !t) {
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
    if (this.dispatchEvent(new CustomEvent("failure", { detail: e })), !this.#_)
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
  #ot(e) {
    this.#se !== e && (this.#se = e, this.#j = !1, this.#P = x, this.#V(), this.#r?.destroy(), this.#r = null, this.#nt(e));
  }
  /**
   * Re-arm film reconstruction at a resource-reallocation point (start, scan
   * change, resize, or re-setting the option). The next frame retries; a
   * repeated failure degrades again and notifies as a new episode.
   */
  #we() {
    return this.#H ? !1 : (this.#m || (this.#se = null), !0);
  }
  /** 一時的な Worker 障害を1回だけ復旧し、再失敗時は media element 自体を表示する。 */
  #ke(e) {
    if (this.#E === "starting" && this.#Z === "auto" && !this.#Te) {
      this.#Xe();
      return;
    }
    if (this.#Dt(e), !this.#Te) {
      this.#Te = !0, this.#Ft();
      return;
    }
    console.error(`Deinterlacer Worker stopped: ${e}`), this.#E = "failed", this.#m?.terminate(), this.#m = null, this.#q(), this.#nt(`deinterlacer worker stopped: ${e}`), this.stop();
  }
  /** Worker を自動選択できなかった場合は元のメインスレッド用 canvas へ戻す。 */
  #Xe() {
    const e = this.#t;
    e.className = this.#n.className;
    const t = this.#n.getAttribute("style");
    t === null ? e.removeAttribute("style") : e.setAttribute("style", t), e.style.visibility = "hidden", this.#n.parentElement && this.#n.replaceWith(e), this.#n = e, this.#et = !1, this.#m?.terminate(), this.#m = null, this.#E = "main", this.#q(), this.#M && (this.#be(), this.#mt(), (this.#g?.interlaced ?? !0) && this.#Pe());
  }
  /** 描画先を切り替えるとき、ページ側がまだ所有する待機フレームを閉じる。 */
  #q() {
    this.#he?.frame.close(), this.#he = null;
  }
  /** Worker の再構築後には応答できない capture を失敗として完了する。 */
  #Dt(e) {
    for (const t of this.#De.values())
      t.reject(new Error(e));
    this.#De.clear();
  }
  start() {
    if (!(this.#M || this.#H || this.#O) && (this.#ie++, this.#M = !0, this.#zt(), !!this.#we())) {
      if (this.#Ye = performance.now(), this.#ui(), this.#mt(), this.#Qt()) {
        this.#m?.postMessage({
          type: "enabled",
          enabled: !0
        }), this.#E === "active" && this.#be();
        return;
      }
      this.#be(), (this.#g?.interlaced ?? !0) && this.#Pe();
    }
  }
  /** Take the deinterlaced picture away, leaving the element's own showing. */
  stop() {
    this.#ie++, this.#M && (this.#M = !1, this.#o.cancel(), this.encodedVideo?.suspend(), this.#oi(), this.#ct(), this.#R = 0, this.#a = null, this.#K(!1), this.#q(), this.#m?.postMessage({
      type: "enabled",
      enabled: !1
    }));
  }
  destroy() {
    if (!this.#H) {
      this.#H = !0, this.#Ie = !1, this.stop(), this.#m?.postMessage({ type: "destroy" }), this.#m?.terminate(), this.#m = null, this.#q(), this.#Dt("the deinterlacer was destroyed"), this.#x?.removeEventListener(
        "visibilitychange",
        this.#dt
      ), this.#x = null, this.#f?.disconnect(), this.#t.removeEventListener(
        "webglcontextlost",
        this.#Wt
      ), this.#o.destroy(), this.encodedVideo?.destroy(), this.#e.removeEventListener("emptied", this.#Ot), this.#e.removeEventListener("resize", this.#Gt), this.#e.removeEventListener("pause", this.#J), this.#e.removeEventListener("ended", this.#J), this.#e.removeEventListener("seeking", this.#Xt), this.#e.removeEventListener("seeked", this.#J), this.#e.removeEventListener("ratechange", this.#J), this.#fi();
      for (const e of this.#A) this.#s.deleteTexture(e);
      this.#A = [], this.#Le();
      for (const e of [
        ...this.#Oe,
        ...this.#fe.map(({ q: t }) => t)
      ])
        this.#s.deleteQuery(e);
      this.#Oe.length = 0, this.#fe.length = 0, this.#r?.destroy(), this.#r = null, this.#ve !== null && (ue(this.#ve), this.#ve = null), this.#s.deleteProgram(this.#p), this.#s.deleteProgram(this.#b), this.#s.getExtension("WEBGL_lose_context")?.loseContext();
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
    if (this.#E === "active" && this.#n.style.visibility === "visible" && this.#m) {
      const s = ++this.#Vt, r = new Promise((o, A) => {
        this.#De.set(s, { resolve: o, reject: A });
      });
      return this.#m.postMessage({
        type: "capture",
        id: s,
        width: this.#e.videoWidth,
        height: this.#e.videoHeight
      }), r;
    }
    if (this.#E === "starting" || this.#E === "failed")
      return createImageBitmap(this.#e);
    const e = this.#a;
    if (this.#_ && (!this.#M || this.#O || !e))
      return Promise.reject(new Error("no rendered picture is available"));
    if (!this.#M || this.#O || !e)
      return createImageBitmap(this.#e);
    e.kind === "texture" ? this.#vt(e.texture, e.flip, !1) : this.#re(e.flush, e.second, null, !1);
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
  #be() {
    this.#_ || !this.#M || this.#o.request(this.#ti);
  }
  /** seek と表示周期の判断に必要な DOM 側の再生状態を複製する。 */
  #At() {
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
  /** 転送中1枚と最新の待機1枚だけを保持し、音声時計からの遅延蓄積を防ぐ。 */
  #Yt(e, t, i, s) {
    let r;
    try {
      r = i?.clone() ?? new VideoFrame(this.#e, {
        timestamp: Math.max(0, Math.round(t.mediaTime * 1e6))
      });
    } catch (A) {
      const a = A instanceof Error ? A.message : String(A);
      this.#Z === "auto" && !this.#Ue && !this.#Te ? (this.#Xe(), this.#He(e, t)) : this.#ke(a);
      return;
    }
    const o = {
      id: ++this.#Ht,
      frame: r,
      // 取得側の画素バッファは次の入力で再利用されるため、ACK 待ちの画像はここで所有する
      pixels: s ? new ImageData(s.data.slice(), s.width, s.height) : void 0,
      now: e,
      metadata: t,
      video: this.#At()
    };
    if (this.#Fe) {
      this.#he?.frame.close(), this.#he = o;
      return;
    }
    this.#Rt(o);
  }
  /** 直前の入力を Worker が解放した後に、選択済みフレームを転送する。 */
  #Rt(e) {
    const t = this.#m;
    if (!t || this.#E !== "active") {
      e.frame.close();
      return;
    }
    this.#Fe = !0;
    const i = {
      type: "frame",
      id: e.id,
      frame: e.frame,
      pixels: e.pixels,
      metadata: e.metadata,
      video: e.video
    };
    try {
      t.postMessage(i, [
        e.frame,
        ...e.pixels ? [e.pixels.data.buffer] : []
      ]);
    } catch (s) {
      this.#Fe = !1, e.frame.close();
      const r = s instanceof Error ? s.message : String(s);
      this.#Z === "auto" && !this.#Ue && !this.#Te ? (this.#Xe(), this.#He(e.now, e.metadata)) : this.#ke(r);
    }
  }
  #jt(e, t, i) {
    this.#ve == null && (this.#ve = le(this.#s, "20px monospace")), fe(this.#ve, e, t, i, this.#I, this.#W, 20);
  }
  #Mt(e) {
    if (this.#ue == null || this.#fe.length > 30)
      return;
    const t = this.#Oe.pop() ?? this.#s.createQuery();
    return this.#s.beginQuery(this.#ue.TIME_ELAPSED_EXT, t), this.#fe.push({ q: t, isField: e }), t;
  }
  #We(e) {
    this.#ue != null && (e != null && this.#s.endQuery(this.#ue.TIME_ELAPSED_EXT), this.#fe = this.#fe.filter(
      ({ q: t, isField: i }) => {
        if (this.#s.getQueryParameter(t, this.#s.QUERY_RESULT_AVAILABLE)) {
          const s = this.#s.getQueryParameter(t, this.#s.QUERY_RESULT);
          return i ? (this.#Se += s, this.#me++) : (this.#_e += s, this.#de++), this.#Oe.push(t), !1;
        }
        return !0;
      }
    ));
  }
  #V() {
    this.#P = x, this.#Ce = x, this.#pe = 0, this.#j = !1, this.#r?.reset();
  }
  /** Detect the pulldown phase of the frame being filtered on the GPU. */
  #qt() {
    const { prev: e, cur: t, next: i } = this.#It(!1), s = this.#A[e], r = this.#A[t], o = this.#A[i];
    if (!s || !r || !o) return;
    const A = this.#g?.topFieldFirst !== !1 ? 0 : 1;
    this.#r?.detect(r, o, A), this.#r?.measureComb(s, r, A);
  }
  /**
   * Read back the previous frame's phase if it has arrived, and advance it
   * to the frame being filtered. The run is not advanced: only the GPU
   * counts observed frames.
   */
  #Kt() {
    const e = this.#r?.poll() ?? null;
    e !== null && (this.#Ce = e, this.#pe = e.age), this.#pe++;
    const { phase: t, run: i } = this.#Ce;
    t === 0 || this.#pe > Math.ceil(I * Math.max(1, this.#e.playbackRate)) ? this.#P = x : this.#P = {
      phase: (t - 1 + this.#pe) % I + 1,
      run: i
    };
  }
  #Jt(e) {
    const t = [], i = this.#r?.metrics ?? new Float32Array(0);
    for (let r = 0; r < p.phase; r++) {
      const o = i[r * 4] ?? 0, A = i[r * 4 + 1] ?? 0, a = i[r * 4 + 2] ?? 0;
      t.push(
        `${o.toFixed(3)},${A.toString().padStart(4)},${a.toFixed(3)}`
      );
    }
    const s = this.#ze.map((r, o) => `${o === 0 ? "-" : o}:${r}`).join(" ");
    return `frame=${e} phase=${this.#P.phase} run=${this.#P.run} known=${this.#Ce.phase}/${this.#Ce.run} age=${this.#pe} ${this.#j ? "film" : "video"} period=${this.#D.toFixed(3)}
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
    const s = this.#ht(i, e.timeOrigin), r = Xe * Math.max(this.#T, this.#D);
    return s < t - r || s > t + r ? t : s;
  }
  #ti = (e, t) => {
    if (!this.#M || this.#O) return;
    this.#ft();
    const i = this.#ht(e, t.timeOrigin);
    this.#Ye = i;
    const { frame: s, pixels: r, ...o } = t;
    this.#Ae = r ?? s ?? this.#e;
    try {
      this.#ii(i, o, s, r);
    } finally {
      this.#Ae = this.#e;
    }
    this.#be();
  };
  /**
   * どちらの通知経路で見つけたフレームも選択中の描画先へ取り込む。
   * `now` はこの realm の時計で測った取込み時刻。
   */
  #ii(e, t, i, s) {
    if (this.#E === "active") {
      this.#Yt(e, t, i, s);
      return;
    }
    this.#E !== "starting" && this.#He(e, t);
  }
  /**
   * @internal Worker でもメインスレッドと同じ履歴と描画判断を使うための入口。
   * `now` はこの Worker の時計で測った取込み時刻を渡す。metadata の表示予定
   * 時刻はページ側の時計のままでよく、同梱の timeOrigin から変換する。
   */
  ingestExternalFrame(e, t, i, s) {
    this.#Ae = s ?? i;
    try {
      this.#He(e, t);
    } finally {
      this.#Ae = this.#e;
    }
  }
  /** 1枚の入力を共通の履歴へ取り込み、YADIF と IVTC の表示判断を完了する。 */
  #He(e, t) {
    const i = this.#ie;
    if (this.#$(i) && (this.#si(t.mediaTime), !!this.#$(i) && t.width > 0 && t.height > 0)) {
      let s = !1;
      if (!this.#ye && this.#e.seeking) {
        const c = this.#e.buffered, m = this.#D >= $ ? this.#D / 1e3 : k / 1e3;
        for (let v = 0; v < c.length; v++)
          if (t.mediaTime >= c.start(v) && t.mediaTime < c.end(v) && Math.abs(t.mediaTime - this.#e.currentTime) <= m) {
            s = !0;
            break;
          }
      }
      if (s && (this.#ye = !0), (this.#I === 0 || this.#W === 0) && this.#Ut(t.width, t.height), !this.#$(i)) return;
      if (this.#g && !this.#g.interlaced) {
        const c = performance.now();
        this.#Pt(c), this.#Ne = c, this.#li(), this.#ae += performance.now() - c, this.#Y++, this.#le++, this.#Bt(c);
        return;
      }
      const r = t.mediaTime - this.#ge, o = t.mozTiming, A = s || (o ? o.discontinuity || r < 0 || r > H : r < 0 || r > H);
      A && (this.#R = 0, this.#D = 0, this.#k.discontinuities++, this.#v(), this.#V());
      const a = this.#ci(t.presentedFrames, A);
      if (this.#R > 0 && t.mediaTime === this.#ge && (!o || t.presentedFrames === this.#Ze))
        return;
      if (!A) {
        const c = o?.periodMs ?? 0;
        c > 0 ? this.#_t(
          c * (this.#e.playbackRate || 1) / 1e3,
          1
        ) : this.#R > 0 && r > 0 && this.#_t(r, a + 1);
      }
      this.#ge = t.mediaTime, this.#Ze = t.presentedFrames;
      const l = performance.now();
      this.#Pt(l), this.#Ne = l;
      const h = performance.now(), f = this.#Mt(!1);
      if (this.#Lt(), this.#F && !this.#se && !this.#r)
        try {
          this.#Tt();
        } catch (c) {
          this.#ot(
            `film detector unavailable: ${c instanceof Error ? c.message : String(c)}`
          );
        }
      if (!this.#$(i)) {
        this.#H || this.#We(f);
        return;
      }
      if (this.#F && !this.#se) {
        if (this.#R === w && a === 0)
          try {
            this.#Kt(), this.#qt();
          } catch (c) {
            this.#ot(
              `film detection failed: ${c instanceof Error ? c.message : String(c)}`
            );
          }
        else
          this.#V();
        this.#ze[this.#P.phase] = (this.#ze[this.#P.phase] ?? 0) + 1, this.#j = this.#P.phase !== 0 && this.#P.run >= z, this.#B && (this.#wt = this.#Jt(t.presentedFrames));
      }
      if (!this.#$(i)) {
        this.#H || this.#We(f);
        return;
      }
      const u = this.#ei(t, e) + this.#T;
      if (this.#j)
        if (this.#Ve()) {
          const c = this.#P.phase;
          if (c === N)
            this.#tt++, this.#ee++;
          else {
            const m = this.#D * I / We, v = this.#lt(1, e, m), E = He[c] ?? 0, L = v || this.#z === null ? u + m : u + E * this.#D;
            this.#$e(
              "film",
              !1,
              this.#at("film", L, m),
              m
            );
          }
        } else
          this.#re(!1, !1, null);
      else if (this.#S && this.#Ve()) {
        const c = this.#D / 2, v = this.#lt(2, e, c) || this.#z === null ? u + c * 2 : u, E = this.#at("field", v, c);
        this.#$e("field", !1, E, c), this.#$e("field", !0, E + c, c);
      } else if (this.#Ve()) {
        const c = this.#D, v = this.#lt(1, e, c) || this.#z === null ? u + c : u;
        this.#$e(
          "frame",
          !1,
          this.#at("frame", v, c),
          c
        ) || (this.#k.late++, this.#re(!1, !1, null));
      } else
        this.#k.late += this.#i.length, this.#v(), this.#re(!1, !1, null);
      this.#ce = Math.max(
        this.#ce,
        this.#i.length
      ), this.#We(f), this.#ae += performance.now() - h, this.#Y++, this.#Bt(l);
    }
  }
  #$(e) {
    return !this.#H && this.#M && e === this.#ie;
  }
  #si(e) {
    const t = this.#ie;
    let i;
    for (let o = this.#oe.length - 1; o >= 0; o--) {
      const A = this.#oe[o];
      if (A.start <= e + 1e-6) {
        i = A;
        break;
      }
    }
    if (i?.codedSize && (i.codedSize.width !== this.#I || i.codedSize.height !== this.#W) && this.#Ut(i.codedSize.width, i.codedSize.height), !this.#$(t)) return;
    const s = i?.scan;
    if (!s || this.#g?.interlaced === s.interlaced && this.#g.topFieldFirst === s.topFieldFirst)
      return;
    const r = this.#g?.interlaced;
    this.#g = s, this.#R = 0, this.#v(), this.#we() && (r !== s.interlaced && (this.#D = 0), s.interlaced && (this.#_ || this.#E === "main") ? this.#Pe() : this.#ct(), this.#V());
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
    return (this.#S || this.#F) && this.#D > 0 && this.#h.length === g;
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
  #_t(e, t) {
    const s = e * 1e3 / (this.#e.playbackRate || 1) / t;
    s < $ || s > k || (this.#D = this.#D > 0 && s > this.#D * Ne ? this.#D + (s - this.#D) * Be : s);
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
    const r = this.#St();
    if (r === null) return !1;
    const o = this.#h[r];
    if (!o) return !1;
    for (this.#c = r; this.#i.length > 0 && this.#i[0]?.slot === r; )
      this.#i.shift(), this.#k.late++;
    this.#re(!1, t, o.framebuffer);
    const A = {
      slot: r,
      at: i,
      duration: s,
      cadence: e,
      phase: e === "film" ? this.#P.phase : e === "field" ? t ? 2 : 1 : 0,
      droppedBefore: this.#ee
    };
    return this.#ee = 0, this.#i.push(A), this.#z = A, !0;
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
    const s = this.#z;
    if (s !== null && s.cadence === e) {
      const r = s.at + s.duration, o = t - r;
      if (Math.abs(o) < i) {
        const A = Math.max(
          -Q,
          Math.min(Q, o * Ge)
        );
        return r + A;
      }
    }
    s !== null && this.#k.resynced++;
    for (let r = this.#i.at(-1); r && r.at >= t; )
      this.#i.pop(), this.#k.late++, r = this.#i.at(-1);
    return t;
  }
  /** Make room without treating ordinary capacity pressure as clock divergence. */
  #lt(e, t, i) {
    const s = this.#i.at(-1), r = (G + 1) * Math.max(this.#T, i);
    if (s && s.at - t > r)
      return this.#v(), this.#k.queueResetted++, !0;
    const o = Math.max(
      0,
      this.#i.length + e - G
    );
    let A = 0, a = 0;
    for (; a < o; ) {
      const l = this.#i.shift();
      if (!l) break;
      A += l.duration, a++;
    }
    for (const l of this.#i) l.at -= A;
    return this.#k.late += a, !1;
  }
  /** Select an output whose pixels are not still represented by the canvas or queue. */
  #St() {
    const e = this.#a?.kind === "texture" ? this.#a.texture : null, t = new Set(this.#i.map(({ slot: s }) => s));
    for (let s = 1; s <= g; s++) {
      const r = (this.#c + s) % g, o = this.#h[r];
      if (o && o.texture !== e && !t.has(r))
        return r;
    }
    const i = this.#i[0];
    if (i) {
      const s = this.#h[i.slot];
      if (s && s.texture !== e) return i.slot;
    }
    return null;
  }
  /** The loop that puts filtered fields up, and the only thing that draws. */
  #Pe() {
    this.#d === null && (!this.#M || this.#O || (this.#C = 0, this.#d = this.#xe(this.#ut)));
  }
  #ct() {
    this.#Qe(this.#d), this.#d = null, this.#v();
  }
  #ut = (e) => {
    if (this.#d = null, !this.#M || this.#O) return;
    this.#ri(e);
    const t = this.#ie;
    this.#o.flush(e), this.#$(t) && (this.#E === "main" && this.#hi(this.#L, e), this.#d = this.#xe(this.#ut));
  };
  /**
   * Fit a grid of refreshes (period and phase) to the animation frames. rAF
   * timestamps wander by a millisecond or so, which is more than the
   * nearest-refresh decision in #present can take; the grid is what it
   * compares against. A frame far off the grid restarts it. (otya)
   */
  #ri(e) {
    const t = e - this.#C;
    this.#C = e;
    const i = Math.max(1, Math.round(t / this.#T)), s = this.#L + i * this.#T, r = e - s;
    if (this.#L === 0 || t <= 0 || t > k || Math.abs(r) > this.#T / 4) {
      t >= 1 && t <= k && (this.#T = t), this.#L = e;
      return;
    }
    this.#T += r / i * Oe, this.#L = s + r * ze;
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
  #Ct() {
    const e = this.#_;
    if (e)
      return { frames: e, origin: performance.timeOrigin };
    const t = this.#n.ownerDocument?.defaultView ?? this.#e.ownerDocument?.defaultView ?? null;
    return t === null ? { frames: $e, origin: performance.timeOrigin } : { frames: t, origin: t.performance.timeOrigin };
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
  #xe(e) {
    const { frames: t, origin: i } = this.#Ct(), s = t.requestAnimationFrame(
      (r) => e(this.#ht(r, i))
    );
    return { frames: t, handle: s };
  }
  /** 予約した表示機会を、それを発行した window 自身で取り消す。 */
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
    if (this.#_) return;
    this.#ni();
    const { frames: e } = this.#Ct(), t = this.#d !== null && this.#d.frames !== e, i = this.#l !== null && this.#l.frames !== e;
    !t && !i || (this.#C = 0, t && (this.#Qe(this.#d), this.#d = this.#xe(this.#ut)), i && (this.#Qe(this.#l), this.#l = this.#xe(this.#pt)));
  }
  /** 描画が停止する非表示通知と DOM の移動を、現在のウインドウで監視する */
  #ni() {
    const e = this.#_ ? null : this.#n.ownerDocument ?? null;
    e !== this.#x && (this.#x?.removeEventListener(
      "visibilitychange",
      this.#dt
    ), this.#x = e, e?.addEventListener("visibilitychange", this.#dt), this.#f?.disconnect(), e && this.#f?.observe(e, { childList: !0, subtree: !0 }));
  }
  #dt = () => {
    this.#H || this.#ft();
  };
  /** ページ側の監視を開始し、描画ループの停止中も復号フレームの到着を検査する。 */
  #mt() {
    this.#_ || this.#l !== null || !this.#M || this.#O || (this.#l = this.#xe(this.#pt));
  }
  /** ページ側で予約済みのフレーム監視を取り消す。 */
  #oi() {
    this.#Qe(this.#l), this.#l = null;
  }
  /** requestAnimationFrame() ごとにフレーム通知の停止を検査し、次の監視を予約する。 */
  #pt = (e) => {
    if (this.#l = null, !this.#M || this.#O) return;
    const t = this.#ie;
    this.#o.flush(e), this.#$(t) && (this.#Ai(e), this.#$(t) && (this.#l = this.#xe(this.#pt)));
  };
  /** 通知停止を検出したら、画像取得を VideoFrames の代替経路へ切り替える */
  #Ai(e) {
    this.#_ || this.#o.captureDriven || this.#o.mozDriven && this.#o.hasDelivered || e - this.#Ye < Ie || this.#e.paused || this.#e.ended || this.#e.readyState < 2 || (this.#be(), this.#o.recover());
  }
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
  #hi(e, t) {
    const i = this.#T / 2, s = (a) => {
      const l = a.at - e;
      return l <= i - Z ? !0 : l > i + Z ? !1 : this.#ne > 0;
    };
    for (; this.#i[1] && s(this.#i[1]); )
      this.#k.late++, this.#i.shift();
    const r = this.#i[0];
    if (!r || !s(r)) return;
    this.#i.shift(), this.#ne = r.at - e;
    const o = performance.now(), A = this.#Mt(!0);
    this.#kt(r.slot), this.#We(A), this.#Me += performance.now() - o, this.#le++, this.#B && this.#ai(r, t), this.#N = t;
  }
  /** Preserve upstream's opt-in presentation timing log in either renderer. */
  #ai(e, t) {
    const i = this.#N === 0 ? 0 : t - this.#N, s = i / this.#T, r = e.cadence === "film" ? `phase ${e.phase}` : e.cadence === "field" ? `field ${e.phase}` : "frame", o = e.phase === 0 ? "duplicate" : `phase ${N}`, A = e.droppedBefore > 0 ? `, ${o} dropped before it` + (e.droppedBefore > 1 ? ` (${e.droppedBefore})` : "") : "";
    console.log(
      `yadif: +${i.toFixed(2)} ms (${s.toFixed(2)} refreshes) ${e.cadence} ${r}, due ${(e.at - t).toFixed(2)} ms${A}`
    );
  }
  /** Copy one of the filtered pictures onto the canvas. */
  #kt(e) {
    const t = this.#h[e];
    t && this.#vt(t.texture);
  }
  /** Put a progressive frame through unchanged, keeping one display surface. */
  #li() {
    this.#Lt();
    const e = this.#A[this.#U];
    e && this.#vt(e, !0), this.#R = 0;
  }
  /** DOM の visibility 変更はページ側に残し、Worker からは状態だけを通知する。 */
  #K(e) {
    if (this.#_) {
      this.#_.onVisibility(e);
      return;
    }
    this.#n.style.visibility = e ? "visible" : "hidden";
  }
  #vt(e, t = !1, i = !0) {
    const s = this.#s;
    s.bindFramebuffer(s.FRAMEBUFFER, null), s.useProgram(this.#b), s.activeTexture(s.TEXTURE0), s.bindTexture(s.TEXTURE_2D, e), s.uniform1i(this.#w, 0), s.uniform1i(this.#y, t ? 1 : 0), s.viewport(0, 0, this.#I, this.#W), s.drawArrays(s.TRIANGLES, 0, 3), this.#a = { kind: "texture", texture: e, flip: t }, this.#K(!0), i && this.#X++;
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
  #ci(e, t) {
    let i = 0;
    return this.#Re !== 0 && !t && (i = Math.max(0, e - this.#Re - 1), this.#k.missed += i), this.#Re = e, i;
  }
  /**
   * Frames stopped arriving for a while -- a pause, a stall, a tab in the
   * background -- and a rate averaged over time nothing was asked of the
   * filter says nothing about it. Begin the interval at this frame.
   */
  #Pt(e) {
    e - this.#Ne <= V || (this.#Ge = e, this.#Y = 0, this.#ae = 0, this.#le = 0, this.#Me = 0, this.#ce = 0, this.#X = 0, this.#_e = 0, this.#de = 0, this.#Se = 0, this.#me = 0);
  }
  #Bt(e) {
    const t = e - this.#Ge;
    if (t < V) return;
    const i = this.#Ve() && (this.#S || this.#j) ? this.#le : this.#Y, s = this.#Y ? (this.#ae + this.#Me) / this.#Y : 0;
    let r;
    this.#ue != null && (r = 0, this.#de !== 0 && (r += this.#_e / 1e6 / this.#de), this.#me !== 0 && (r += this.#Se / 1e6 / this.#me / 2));
    const o = {
      ...this.#k,
      // The element's own count of what its decoder could not keep up with,
      // which is the machine being behind rather than this filter.
      dropped: this.#e.getVideoPlaybackQuality?.().droppedVideoFrames ?? 0,
      fps: i * 1e3 / t,
      frameMs: s,
      maxQueuedFields: this.#ce,
      outputFps: this.#X * 1e3 / t,
      gpuMs: r,
      film: this.#j,
      filmError: this.#se
    };
    this.dispatchEvent(new CustomEvent("stats", { detail: o })), this.#je?.(o), this.#Ge = e, this.#Y = 0, this.#ae = 0, this.#le = 0, this.#Me = 0, this.#ce = 0, this.#X = 0, this.#_e = 0, this.#de = 0, this.#Se = 0, this.#me = 0;
  }
  /** Take the newest frame into the ring. */
  #Lt() {
    const e = this.#s;
    this.#U = (this.#U + 1) % w, e.bindTexture(e.TEXTURE_2D, this.#A[this.#U] ?? null), e.texImage2D(
      e.TEXTURE_2D,
      0,
      e.RGBA,
      e.RGBA,
      e.UNSIGNED_BYTE,
      this.#Ae
    ), this.#R = Math.min(this.#R + 1, w);
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
  #re(e, t, i, s = !0) {
    if (this.#R === 0 || this.#O) return;
    s && (this.#R === w && !e ? this.#k.filtered++ : this.#k.degraded++);
    const r = this.#s, { prev: o, cur: A, next: a } = this.#It(e);
    r.bindFramebuffer(r.FRAMEBUFFER, i), r.useProgram(this.#p);
    for (const [u, c] of [o, A, a].entries())
      r.activeTexture(r.TEXTURE0 + u), r.bindTexture(r.TEXTURE_2D, this.#A[c] ?? null);
    r.uniform1i(this.#u.prev, 0), r.uniform1i(this.#u.cur, 1), r.uniform1i(this.#u.next, 2);
    const l = this.#F ? this.#r?.texture ?? null : null, h = this.#F ? this.#r?.combTexture ?? null : null, f = l !== null && h !== null;
    l !== null && h !== null && (r.activeTexture(r.TEXTURE0 + 3), r.bindTexture(r.TEXTURE_2D, l), r.uniform1i(this.#u.fieldMetrics, 3), r.activeTexture(r.TEXTURE0 + 4), r.bindTexture(r.TEXTURE_2D, h), r.uniform1i(this.#u.comb, 4)), r.uniform2i(this.#u.size, this.#I, this.#W);
    const d = this.#bt ? 0 : 1;
    r.uniform1i(this.#u.parity, t ? 1 - d : d), r.uniform1i(this.#u.tff, this.#bt ? 1 : 0), r.uniform1i(this.#u.second, t ? 1 : 0), r.uniform1i(this.#u.spatialCheck, this.#G ? 1 : 0), r.uniform1i(this.#u.debug, this.#B ? 1 : 0), r.uniform1i(this.#u.film, f ? 1 : 0), r.uniform1i(this.#u.phase, this.#P.phase), r.viewport(0, 0, this.#I, this.#W), r.drawArrays(r.TRIANGLES, 0, 3), this.#B && f && this.#jt(this.#wt, 0, 90), i === null && (this.#a = { kind: "yadif", flush: e, second: t }, this.#K(!0), s && this.#X++);
  }
  #It(e) {
    const t = (i) => (this.#U + w - i) % w;
    return this.#R === 1 ? { prev: this.#U, cur: this.#U, next: this.#U } : e ? { prev: t(1), cur: this.#U, next: this.#U } : this.#R === 2 ? { prev: t(1), cur: t(1), next: this.#U } : { prev: t(2), cur: t(1), next: this.#U };
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
  #Be() {
    if (this.#ft(), !this.#Q) return;
    const e = this.#e, t = e.videoWidth, i = e.videoHeight;
    if (t === 0 || i === 0) return;
    const s = Math.min(
      e.offsetWidth / t,
      e.offsetHeight / i
    ), r = t * s, o = i * s;
    this.#n.style.left = `${e.offsetLeft + (e.offsetWidth - r) / 2}px`, this.#n.style.top = `${e.offsetTop + (e.offsetHeight - o) / 2}px`, this.#n.style.width = `${r}px`, this.#n.style.height = `${o}px`;
  }
  #Ut(e, t) {
    const i = this.#s;
    this.#t.width = e, this.#t.height = t, this.#I = e, this.#W = t, this.#R = 0, this.#a = null, this.#v(), this.#Be();
    for (const s of this.#A) i.deleteTexture(s);
    this.#A = [];
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
      ), this.#A.push(r);
    }
    this.#Le(), (this.#S || this.#F) && this.#Nt(), this.#r?.resize(e, t), this.#we();
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
    const e = this.#s;
    if (!(this.#h.length === g || this.#I === 0)) {
      this.#Le();
      for (let t = 0; t < g; t++) {
        const i = e.createTexture();
        e.bindTexture(e.TEXTURE_2D, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texImage2D(
          e.TEXTURE_2D,
          0,
          e.RGBA,
          this.#I,
          this.#W,
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
          e.deleteFramebuffer(s), e.deleteTexture(i), this.#Le();
          return;
        }
        this.#h.push({ texture: i, framebuffer: s });
      }
      this.#c = g - 1;
    }
  }
  #Le() {
    const e = this.#s, t = this.#a?.kind === "texture" ? this.#a.texture : null;
    this.#h.some((i) => i.texture === t) && (this.#a = null);
    for (const { texture: i, framebuffer: s } of this.#h)
      e.deleteFramebuffer(s), e.deleteTexture(i);
    this.#h = [], this.#v();
  }
  /**
   * Wrap the element in a `<div>` of this one's own and put the canvas over
   * it. The wrapper is what the canvas is positioned against; moving the
   * element out of the tree and back within the one task leaves playback
   * alone, which is what makes turning this on mid-stream free.
   */
  #ui() {
    if (this.#Q) return;
    const e = this.#e.parentElement;
    if (!e) return;
    const t = document.createElement("div");
    t.style.cssText = "position:relative;display:inline-block;line-height:0;max-width:100%", e.insertBefore(t, this.#e), t.appendChild(this.#e), t.appendChild(this.#n), this.#Q = t, this.#te?.observe(this.#e), this.#Be();
  }
  #fi() {
    if (this.#_) return;
    const e = this.#Q;
    this.#Q = null, this.#te?.disconnect(), this.#n.remove(), e?.parentElement && (e.parentElement.insertBefore(this.#e, e), e.remove());
  }
  #Gt = () => this.#Be();
  /** media event と、その意味を決めたページ側の再生状態を Worker へ転送する。 */
  #Et(e) {
    return !this.#m || this.#E === "main" ? !1 : (this.#m.postMessage({
      type: "event",
      name: e,
      video: this.#At()
    }), !0);
  }
  #Ot = () => {
    if (this.#Et("emptied")) {
      this.#q(), this.#K(!1);
      return;
    }
    this.#R = 0, this.#ge = 0, this.#Ze = 0, this.#v(), this.#V(), this.#D = 0, this.#zt(), this.#a = null, this.#K(!1);
  };
  #zt() {
    this.#k = {
      filtered: 0,
      missed: 0,
      degraded: 0,
      discontinuities: 0,
      resynced: 0,
      late: 0,
      queueResetted: 0
    }, this.#ze.fill(0), this.#tt = 0, this.#Re = 0, this.#Ge = 0, this.#Ne = 0, this.#Y = 0, this.#ae = 0, this.#le = 0, this.#Me = 0, this.#ce = 0, this.#X = 0, this.#v(), this.#_e = 0, this.#de = 0, this.#Se = 0, this.#me = 0;
  }
  /**
   * A new seek invalidates any destination frame remembered for the last one.
   */
  #Xt = () => {
    if (this.#Et("seeking")) {
      this.#q();
      return;
    }
    this.#ye = !1;
  };
  /**
   * Playback stopped, so the frame being held back goes up now. One picture,
   * whatever the rate: a still frame stands for a moment, and the moment is
   * the one the first field was taken at.
   */
  #J = (e) => {
    if ((e.type === "pause" || e.type === "ended" || e.type === "seeked" || e.type === "ratechange") && this.#Et(e.type)) {
      this.#q();
      return;
    }
    if (e.type === "seeked") {
      const i = this.#ye;
      if (this.#ye = !1, i) return;
      this.#R = 0, this.#v(), this.#V(), this.#a = null, this.#K(!1);
      return;
    }
    const t = e.type === "ratechange";
    if (t && (this.#D = 0, this.#ge = this.#e.currentTime), this.#v(), this.#M && this.#R > 0) {
      const i = this.#St(), s = i === null ? void 0 : this.#h[i];
      i !== null && s ? (this.#c = i, this.#re(!0, !1, s.framebuffer), this.#kt(i)) : this.#re(!0, !1, null);
    }
    t && (this.#R = 0, this.#Re = 0, this.#V());
  };
  /**
   * A lost context takes the textures and the program with it. Rebuilding
   * them is possible, but a page that has lost its context has bigger
   * problems; getting out of the way leaves the element's own picture showing.
   */
  #Wt = (e) => {
    if (e.preventDefault(), this.#_) {
      this.#_.onFailure("the deinterlacer WebGL context was lost");
      return;
    }
    this.#E !== "active" && (this.#O = !0, this.#nt("the deinterlacer WebGL context was lost"), this.stop());
  };
}
function Y(n, e) {
  const t = n.createProgram(), i = j(n, n.VERTEX_SHADER, Ue), s = j(n, n.FRAGMENT_SHADER, e);
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
const q = "data:video/mp4;base64,AAAAHGZ0eXBpc281AAACAGlzbzVpc282bXA0MQAAAu9tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAAAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAB8nRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAFoAAABDgAAAAAAY5tZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAHUwAAAAAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE5bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+XN0YmwAAACtc3RzZAAAAAAAAAABAAAAnWF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAFoAQ4AEgAAABIAAAAAAAAAAEVTGF2YzYxLjE5LjEwMSBsaWJ4MjY0AAAAAAAAAAAAAAAY//8AAAA3YXZjQwFkACn/4QAZZ2QAKazZQFoET94CIAAAfSAAHUwD4sWywAEAB2j5KBLLIsD9+PgAAAAAEHBhc3AAAAABAAAAAQAAABBzdHRzAAAAAAAAAAAAAAAQc3RzYwAAAAAAAAAAAAAAFHN0c3oAAAAAAAAAAAAAAAAAAAAQc3RjbwAAAAAAAAAAAAAAKG12ZXgAAAAgdHJleAAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAGF1ZHRhAAAAWW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALGlsc3QAAAAkqXRvbwAAABxkYXRhAAAAAQAAAABMYXZmNjEuNy4xMDAAAACYbW9vZgAAABBtZmhkAAAAAAAAAAEAAACAdHJhZgAAABx0ZmhkAAIAOAAAAAEAAAPpAAAEJwEBAAAAAAAUdGZkdAEAAAAAAAAAAAAAAAAAAEh0cnVuAAAKBQAAAAYAAACgAgAAAAAABCcAAAfSAAAAQgAAE40AAAA/AAAH0gAAAgAAAAAAAAAARAAAA+kAAAG7AAAH0gAACK9tZGF0AAACrwYF//+r3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTQgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDEzMyBtZT11bWggc3VibWU9MTAgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0yNCBjaHJvbWFfbWU9MSB0cmVsbGlzPTIgOHg4ZGN0PTEgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0xNSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9dGZmIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MyBiX3B5cmFtaWQ9MiBiX2FkYXB0PTIgYl9iaWFzPTAgZGlyZWN0PTMgd2VpZ2h0Yj0xIG9wZW5fZ29wPTAgd2VpZ2h0cD0wIGtleWludD0zMCBrZXlpbnRfbWluPTMgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0zMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTguMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAAUGAQEygAAAAWdliIICAj/+/76ivgU3edyfbbnP6kzu1BfFPXa9rMu/FCi/GMk76JT20AAAAwAAAwAAAwAAAwAAAwAAAwEJmrWZnq7KhXxVTgAAAwAAAwAAAwAABJ9gAAADAAAKtgAAAwAAAwCi4AAAAwAAHQgAAAMAAAiqAAADAAADA7EAAAMAAAMCCgAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAL+QAAAAUGAQEygAAAADVBmiIWQj/51kP//f3t2AAPsAAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAS8AAAAAUGAQEygAAAADJBnkETiEf/hv/80gAJcAAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAkIQAAAAUGAQEygAAAAfMBnmCTRCP/9ZJR/1zH/6vL5qeSOTmASFdQlObW+4YAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAxvEAAAAwAAAwAAAwAAE4wAAAMAAAMAAAMAAFuAAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAAADAMuAAAAABQYBATKAAAAANwGeYZakI//1bXH/Een/+rAALngAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAAAMAN+EAAAAFBgEBMoAAAAGuQZpileloiEf/2XyP/Fn/6mXyw21/v4X7ly3FFO60AAADAAADAAADAAADAAADAAADAAADADKWVJAQiFeS9HQZhFSJuVc/HAAAAwAAAwAAAwAAAwAAAwAAAwAAj8AAAAMAAAMABTIAAAMAAAMAAD+QAAADAAADAAQkAAADAAADAABJgAAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAAAwAXUQAAAENtZnJhAAAAK3RmcmEBAAAAAAAAAQAAAAAAAAABAAAAAAAAB9IAAAAAAAADCwEBAQAAABBtZnJvAAAAAAAAAEM=", Qe = 0.5, Ze = 3e3, K = 0.1, F = 16, J = 'video/mp4; codecs="avc1.640029"';
let O = null;
function Ye(n = {}) {
  return O ??= je(n), O;
}
async function st(n = {}) {
  return (await Ye(n)).deinterlaces;
}
function rt() {
  O = null;
}
async function je(n) {
  const e = n.tolerance ?? Qe, t = n.timeoutMs ?? Ze, i = performance.now(), s = (A) => ({
    deinterlaces: !1,
    survives: null,
    tookMs: performance.now() - i,
    error: A instanceof Error ? A.message : String(A)
  });
  if (typeof document > "u")
    return s(new Error("there is no document to decode in"));
  const r = document.createElement("video");
  r.muted = !0, r.defaultMuted = !0, r.playsInline = !0, r.preload = "auto";
  let o = null;
  try {
    o = Ke(r, t);
    const A = B(P(r, "loadeddata"), t), a = r.play().then(
      () => !0,
      () => !1
    );
    if (await o.ready, await A, await Je(r, t, await a), r.videoWidth === 0 || r.videoHeight === 0)
      return s(new Error("the probe clip decoded to nothing"));
    const l = et(r);
    return {
      deinterlaces: l < 1 - e,
      survives: l,
      tookMs: performance.now() - i
    };
  } catch (A) {
    return s(A);
  } finally {
    r.pause(), r.removeAttribute("src"), r.replaceChildren(), r.load(), o && URL.revokeObjectURL(o.url);
  }
}
const U = typeof MediaSource > "u" ? globalThis.ManagedMediaSource : MediaSource, qe = typeof MediaSource > "u";
function Ke(n, e) {
  if (!U || !U.isTypeSupported(J))
    throw new Error("the probe clip needs Media Source Extensions");
  const t = q.indexOf(","), i = atob(q.slice(t + 1)), s = new Uint8Array(i.length);
  for (let a = 0; a < i.length; a++) s[a] = i.charCodeAt(a);
  const r = new U(), o = URL.createObjectURL(r);
  if (qe) {
    n.disableRemotePlayback = !0;
    const a = document.createElement("source");
    a.type = "video/mp4", a.src = o, n.append(a), n.load();
  } else
    n.src = o;
  const A = (async () => {
    await B(P(r, "sourceopen"), e);
    const a = r.addSourceBuffer(J), l = B(P(a, "updateend"), e);
    a.appendBuffer(s), await l, r.endOfStream();
  })();
  return { url: o, ready: A };
}
async function Je(n, e, t) {
  if (t) {
    const i = performance.now();
    for (; n.currentTime < K && performance.now() - i < e; )
      await new Promise((s) => requestAnimationFrame(s));
    n.pause();
  } else
    n.currentTime = K, await B(P(n, "seeked"), e);
}
function et(n) {
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
  let o = 0;
  const A = 2, a = e - 3;
  let l = r(A);
  for (let h = A + 1; h <= a; h++) {
    const f = r(h);
    o += Math.abs(f - l), l = f;
  }
  return o / (a - A) / 255;
}
function P(n, e) {
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
Pe(Ae);
export {
  it as Deinterlacer,
  Fe as YADIF_FRAGMENT_SHADER,
  Te as YADIF_UNIFORMS,
  st as decoderDeinterlaces,
  rt as forgetDecoderProbe,
  Ye as probeDecoder,
  tt as supportsDeinterlace
};
//# sourceMappingURL=index.js.map
