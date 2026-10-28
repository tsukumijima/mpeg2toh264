(function(){"use strict";const M=`#version 300 es
void main() {
  // From the vertex index alone. There is no geometry here worth a buffer.
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;function S(n,e,t){const i=n.createProgram(),s=G(n,n.VERTEX_SHADER,t),r=G(n,n.FRAGMENT_SHADER,e);if(n.attachShader(i,s),n.attachShader(i,r),n.linkProgram(i),n.deleteShader(s),n.deleteShader(r),!n.getProgramParameter(i,n.LINK_STATUS)){const h=n.getProgramInfoLog(i);throw n.deleteProgram(i),new Error(`the deinterlacer failed to link: ${h??"no reason given"}`)}return i}function G(n,e,t){const i=n.createShader(e);if(!i)throw new Error("the deinterlacer could not create a shader");if(n.shaderSource(i,t),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS)){const s=n.getShaderInfoLog(i);throw n.deleteShader(i),new Error(`the deinterlacer failed to compile: ${s??"no reason given"}`)}return i}const te=`#version 300 es
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
`,ie=`#version 300 es
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
`;function se(n,e){const t=S(n,te,ie),i=n.getAttribLocation(t,"aVertexPosition"),s=n.getAttribLocation(t,"aTextureCoord"),r=n.getUniformLocation(t,"uTexture"),h=n.getUniformLocation(t,"uMatrix"),o=n.getUniformLocation(t,"uUvMatrix"),l=n.getUniformLocation(t,"uTextColor"),u=n.getUniformLocation(t,"uBackColor");if(r==null||h==null||o==null||l==null||u==null)throw new Error("failed to initialize DEBUG_FRAGMENT_SHADER, DEBUG_VERTEX_SHADER");const a=n.createBuffer(),d=n.createBuffer();return{gl:n,...re(n,e),program:t,programUniforms:{vertex:i,textureCoord:s,texture:r,matrix:h,uvMatrix:o,textColor:l,backColor:u},positionBuffer:a,textureBuffer:d}}function re(n,e){const t=new OffscreenCanvas(0,0),i=t.getContext("2d"),s=new Map;let r=0;const h=0;let o=1;i.font=e,i.fillStyle="white";for(let u=32;u<128;u++){const a=String.fromCharCode(u),d=i.measureText(a),x=Math.ceil(d.actualBoundingBoxDescent+d.actualBoundingBoxAscent+1),f=Math.ceil(d.actualBoundingBoxLeft+d.actualBoundingBoxRight+1);s.set(a,{x:r,y:h,width:f,height:x,metrics:d}),o=Math.max(o,x),r+=f}t.width=r,t.height=o,i.font=e,i.fillStyle="white";for(const[u,a]of s)i.fillText(u,Math.floor(a.x+a.metrics.actualBoundingBoxLeft+1),Math.floor(a.metrics.actualBoundingBoxAscent+1));const l=n.createTexture();return n.bindTexture(n.TEXTURE_2D,l),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t),{fontTexture:l,chars:s,textureSize:{width:r,height:o}}}function ne(n){const e=n.gl;e.deleteBuffer(n.positionBuffer),e.deleteBuffer(n.textureBuffer),e.deleteTexture(n.fontTexture),e.deleteProgram(n.program)}function he(n,e,t,i,s,r,h){const o=[],l=[],u=t;for(const x of e){if(x===`
`){t=u,i+=h;continue}const f=n.chars.get(x);if(f==null)continue;if(f.width===1){t+=f.metrics.width;continue}const c=Math.floor(t-f.metrics.actualBoundingBoxLeft),p=Math.floor(i-f.metrics.actualBoundingBoxAscent),v=c+f.width,b=p+f.height;o.push(c,p),l.push(f.x,f.y),o.push(c,b),l.push(f.x,f.y+f.height),o.push(c+f.width,b),l.push(f.x+f.width,f.y+f.height),o.push(v,b),l.push(f.x+f.width,f.y+f.height),o.push(c,p),l.push(f.x,f.y),o.push(v,p),l.push(f.x+f.width,f.y),t+=f.metrics.width}const a=n.gl;a.useProgram(n.program),a.bindBuffer(a.ARRAY_BUFFER,n.positionBuffer),a.bufferData(a.ARRAY_BUFFER,new Float32Array(o),a.STATIC_DRAW),a.vertexAttribPointer(n.programUniforms.vertex,2,a.FLOAT,!1,0,0),a.enableVertexAttribArray(n.programUniforms.vertex),a.bindBuffer(a.ARRAY_BUFFER,n.textureBuffer),a.bufferData(a.ARRAY_BUFFER,new Float32Array(l),a.STATIC_DRAW),a.vertexAttribPointer(n.programUniforms.textureCoord,2,a.FLOAT,!1,0,0),a.enableVertexAttribArray(n.programUniforms.textureCoord),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,n.fontTexture),a.uniform1i(n.programUniforms.texture,0),a.uniform3fv(n.programUniforms.textColor,[1,1,1]),a.uniform3fv(n.programUniforms.backColor,[0,0,0]);function d(x,f,c){const p=[];for(let v=0;v<f;v++)for(let b=0;b<x;b++)p.push(c[b*x+v]);return p}a.uniformMatrix4fv(n.programUniforms.matrix,!1,d(4,4,[1/(s/2),0,0,-1,0,-2/r,0,1,0,0,1,0,0,0,0,1])),a.uniformMatrix3fv(n.programUniforms.uvMatrix,!1,d(3,3,[1/n.textureSize.width,0,0,0,1/n.textureSize.height,0,0,0,1])),a.viewport(0,0,s,r),a.enable(a.BLEND),a.blendFunc(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA),a.drawArrays(a.TRIANGLES,0,o.length/2),a.disable(a.BLEND)}const m={firstRepeatsPrevious:0,secondRepeatsNext:1,secondRepeatsPrevious:2,previousSecondRepeated:3,firstRepeatsNext:4,previousFirstRepeated:5,phase:6},F=7,X=2,U=1,oe=2,I=10,ae={a:"uA",b:"uB",fieldMetrics:"uFieldMetrics",first:"uFirst",size:"uSize"},$=16,V=8,le=`#version 300 es

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
  const int BLOCK_W = ${$};
  const int BLOCK_H = ${V};

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

  float run = texelFetch(uFieldMetrics, ivec2(${m.phase}, 0), 0)[1];
  float threshold = run == 0.0 ? 0.025 : (run <= 10.0 ? 0.11 : 0.15);

  vec4 even = measure(diffEven, float(totalEven), threshold);
  vec4 odd = measure(diffOdd, float(totalOdd), threshold);
  outFirst = uFirst == 0 ? even : odd;
  outSecond = uFirst == 0 ? odd : even;
}
`,ce={second:"uSecond",first:"uFirst",size:"uSize"},C=8,ue=`#version 300 es
precision highp float;

uniform sampler2D uSecond;
uniform sampler2D uFirst;

uniform ivec2 uSize;

layout(location = 0) out vec4 outSecond;
layout(location = 1) out vec4 outFirst;

void main()
{
  ivec2 dst = ivec2(gl_FragCoord.xy);
  ivec2 base = dst * ${C};

  vec4 second = vec4(0.0);
  vec4 first = vec4(0.0);

  for (int y = 0; y < ${C}; ++y) {
    for (int x = 0; x < ${C}; ++x) {
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
`,fe={previous:"uPrevious",second:"uSecond",first:"uFirst",size:"uSize"},de=`#version 300 es
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
  return differing <= ${X}.0;
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
  bool believed = run >= ${I}.0;
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
  if (metric == ${m.firstRepeatsPrevious}) {
    outValue = previous(${m.firstRepeatsNext});
  } else if (metric == ${m.secondRepeatsNext}) {
    outValue = fold(uSecond);
  } else if (metric == ${m.secondRepeatsPrevious}) {
    outValue = previous(${m.secondRepeatsNext});
  } else if (metric == ${m.previousSecondRepeated}) {
    outValue = previous(${m.secondRepeatsPrevious});
  } else if (metric == ${m.firstRepeatsNext}) {
    outValue = fold(uFirst);
  } else if (metric == ${m.previousFirstRepeated}) {
    outValue = previous(${m.firstRepeatsPrevious});
  } else {
    outValue = decide(
      previous(${m.phase}),
      previous(${m.firstRepeatsNext}),
      fold(uSecond),
      previous(${m.secondRepeatsNext}),
      previous(${m.secondRepeatsPrevious}),
      fold(uFirst),
      previous(${m.firstRepeatsPrevious})
    );
  }
}
`,R=16,me=8,pe={prev:"uPrev",cur:"uCur",first:"uFirst",size:"uSize"},ve=`#version 300 es
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
  ivec2 base = block * ${R};
  float standing = 0.0;
  float woven = 0.0;
  for (int dy = 0; dy < ${R}; ++dy) {
    int y = base.y + dy;
    if (y >= uSize.y || (y & 1) == uFirst) continue;
    for (int dx = 0; dx < ${R}; ++dx) {
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
`,xe={prev:"uPrev",cur:"uCur",next:"uNext",size:"uSize",parity:"uParity",tff:"uTff",spatialCheck:"uSpatialCheck",debug:"uDebug",film:"uFilm",second:"uSecond",phase:"uPhase",fieldMetrics:"uFieldMetrics",comb:"uComb"},be=`#version 300 es
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
  return texelFetch(uFieldMetrics, ivec2(metric, 0), 0)[1] <= ${X}.0;
}

/** The pulldown phase the detection gave this frame, or 0. See film-shader.ts. */
int detectedPhase() {
  vec4 phase = texelFetch(uFieldMetrics, ivec2(${m.phase}, 0), 0);
  // Deinterlace each field normally until the cadence is confirmed.
  return phase[1] >= ${I}.0 ? int(phase[0]) : 0;
}

bool isMixedPhase(int phase) {
  return phase == ${U} || phase == ${oe};
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
    vec4 comb = texelFetch(uComb, ivec2(x / ${R}, y / ${R}), 0);
    bool combedBlock = (mixed ? comb[1] : comb[0]) > ${me}.0;
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
`,w={phase:0,run:0};function L(n,e,t){return Object.fromEntries(Object.entries(t).map(([i,s])=>[i,n.getUniformLocation(e,s)]))}class H{#t;#n;#e;#h;#i;#r;#v;#f;#g;#E=null;#F=null;#o=null;#a=null;#u=0;#l=null;#s=null;#m=0;#D=0;metrics=new Float32Array(F*4);#c=0;#y=0;constructor(e){this.#t=e,this.#n=S(e,le,M),this.#e=L(e,this.#n,ae),this.#h=S(e,ue,M),this.#i=L(e,this.#h,ce),this.#r=S(e,de,M),this.#v=L(e,this.#r,fe),this.#f=S(e,ve,M),this.#g=L(e,this.#f,pe)}get texture(){return this.#a?.[this.#u]?.textures[0]??null}get combTexture(){return this.#o?.textures[0]??null}resize(e,t){e===this.#c&&t===this.#y||(this.#c=e,this.#y=t,this.#R())}reset(){const e=this.#t;e.deleteSync(this.#s),this.#s=null,this.#m=0;const t=this.#a?.[this.#u];if(!t)return;const i=new Float32Array(F*4);for(let s=0;s<m.phase;s++)i[s*4+1]=1;e.bindTexture(e.TEXTURE_2D,t.textures[0]??null),e.texSubImage2D(e.TEXTURE_2D,0,0,0,F,1,e.RGBA,e.FLOAT,i)}detect(e,t,i){const s=this.#t;if(this.#c===0||this.#y===0)return;this.#B();const r=this.#E,h=this.#F,o=this.#a;if(r===null||h===null||o===null)return;const l=o[this.#u],u=o[1-this.#u];if(s.bindFramebuffer(s.FRAMEBUFFER,r.framebuffer),s.useProgram(this.#n),this.#d(0,e,this.#e.a),this.#d(1,t,this.#e.b),this.#d(2,l.textures[0],this.#e.fieldMetrics),s.uniform1i(this.#e.first,i),s.uniform2i(this.#e.size,this.#c,this.#y),s.viewport(0,0,r.width,r.height),s.drawArrays(s.TRIANGLES,0,3),s.bindFramebuffer(s.FRAMEBUFFER,h.framebuffer),s.useProgram(this.#h),this.#d(0,r.textures[0],this.#i.second),this.#d(1,r.textures[1],this.#i.first),s.uniform2i(this.#i.size,r.width,r.height),s.viewport(0,0,h.width,h.height),s.drawArrays(s.TRIANGLES,0,3),s.bindFramebuffer(s.FRAMEBUFFER,u.framebuffer),s.useProgram(this.#r),this.#d(0,l.textures[0],this.#v.previous),this.#d(1,h.textures[0],this.#v.second),this.#d(2,h.textures[1],this.#v.first),s.uniform2i(this.#v.size,h.width,h.height),s.viewport(0,0,F,1),s.drawArrays(s.TRIANGLES,0,3),this.#u=1-this.#u,this.#m++,this.#s!==null){s.bindFramebuffer(s.FRAMEBUFFER,null);return}this.#D=this.#m,s.bindBuffer(s.PIXEL_PACK_BUFFER,this.#l),s.readPixels(0,0,F,1,s.RGBA,s.FLOAT,0),s.bindBuffer(s.PIXEL_PACK_BUFFER,null),s.bindFramebuffer(s.FRAMEBUFFER,null),this.#s=s.fenceSync(s.SYNC_GPU_COMMANDS_COMPLETE,0),s.flush()}measureComb(e,t,i){const s=this.#t;if(this.#c===0||this.#y===0)return;this.#B();const r=this.#o;r!==null&&(s.bindFramebuffer(s.FRAMEBUFFER,r.framebuffer),s.useProgram(this.#f),this.#d(0,e,this.#g.prev),this.#d(1,t,this.#g.cur),s.uniform1i(this.#g.first,i),s.uniform2i(this.#g.size,this.#c,this.#y),s.viewport(0,0,r.width,r.height),s.drawArrays(s.TRIANGLES,0,3),s.bindFramebuffer(s.FRAMEBUFFER,null))}poll(){const e=this.#t,t=this.#s;if(t===null||this.#l===null)return null;switch(e.clientWaitSync(t,0,0)){case e.ALREADY_SIGNALED:case e.CONDITION_SATISFIED:return e.bindBuffer(e.PIXEL_PACK_BUFFER,this.#l),e.getBufferSubData(e.PIXEL_PACK_BUFFER,0,this.metrics),e.bindBuffer(e.PIXEL_PACK_BUFFER,null),e.deleteSync(t),this.#s=null,{phase:this.metrics[m.phase*4]??0,run:this.metrics[m.phase*4+1]??0,age:this.#m-this.#D};default:return null}}destroy(){const e=this.#t;if(this.#R(),this.#a!==null){for(const t of this.#a)P(e,t);this.#a=null}e.deleteSync(this.#s),this.#s=null,e.deleteBuffer(this.#l),this.#l=null,e.deleteProgram(this.#n),e.deleteProgram(this.#h),e.deleteProgram(this.#r),e.deleteProgram(this.#f)}#d(e,t,i){const s=this.#t;s.activeTexture(s.TEXTURE0+e),s.bindTexture(s.TEXTURE_2D,t??null),s.uniform1i(i,e)}#R(){const e=this.#t;this.#E!==null&&P(e,this.#E),this.#F!==null&&P(e,this.#F),this.#o!==null&&P(e,this.#o),this.#E=null,this.#F=null,this.#o=null}#B(){const e=this.#t;if(this.#E===null||this.#F===null||this.#o===null){this.#R();const t=Math.ceil(this.#c/$),i=Math.ceil(this.#y/(V*2));this.#E=D(e,t,i,2),this.#F=D(e,Math.ceil(t/C),Math.ceil(i/C),2),this.#o=D(e,Math.ceil(this.#c/R),Math.ceil(this.#y/R),1)}this.#a===null&&(this.#a=[D(e,F,1,1),D(e,F,1,1)],this.#u=0,this.reset()),this.#l===null&&(this.#l=e.createBuffer(),e.bindBuffer(e.PIXEL_PACK_BUFFER,this.#l),e.bufferData(e.PIXEL_PACK_BUFFER,this.metrics.byteLength,e.STREAM_COPY),e.bindBuffer(e.PIXEL_PACK_BUFFER,null))}}function D(n,e,t,i){const s=n.createFramebuffer();n.bindFramebuffer(n.FRAMEBUFFER,s);const r=[];for(let l=0;l<i;l++){const u=n.createTexture();n.bindTexture(n.TEXTURE_2D,u),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texImage2D(n.TEXTURE_2D,0,n.RGBA32F,e,t,0,n.RGBA,n.FLOAT,null),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+l,n.TEXTURE_2D,u,0),r.push(u)}n.drawBuffers(r.map((l,u)=>n.COLOR_ATTACHMENT0+u));const h=n.checkFramebufferStatus(n.FRAMEBUFFER)===n.FRAMEBUFFER_COMPLETE;n.bindFramebuffer(n.FRAMEBUFFER,null);const o={framebuffer:s,textures:r,width:e,height:t};if(!h)throw P(n,o),new Error("failed to allocate framebuffer");return o}function P(n,{framebuffer:e,textures:t}){n.deleteFramebuffer(e);for(const i of t)n.deleteTexture(i)}function _(n,e=0,t=n.length){const i=new DataView(n.buffer,n.byteOffset,n.byteLength),s=[];for(let r=e;r<t;){if(r+8>t)throw new Error("Incomplete MP4 box");const h=i.getUint32(r);if(h<8||r+h>t)throw new Error("Invalid MP4 box size");s.push({type:String.fromCharCode(...n.subarray(r+4,r+8)),start:r,body:r+8,end:r+h}),r+=h}return s}function Ee(n,e){for(const t of _(n,e.body,e.end).filter(i=>i.type==="trak")){let i=t;for(const s of["mdia","minf","stbl","stsd"]){const r=_(n,i.body,i.end).find(h=>h.type===s);if(!r)break;i=r}if(i.type==="stsd")for(const s of _(n,i.body+8,i.end)){if(s.type!=="avc1")continue;const r=_(n,s.body+78,s.end).find(l=>l.type==="avcC");if(!r)throw new Error("AVC sample entry has no avcC");const h=n.slice(r.body,r.end);return{codec:"avc1."+Array.from(h.subarray(1,4)).map(l=>l.toString(16).padStart(2,"0")).join(""),description:h}}}return null}class ge{#t;#n=null;#e=null;#h=[];#i=0;#r=null;#v=[];#f=new Set;#g=!1;#E=!1;#F=!1;#o=!1;#a=!1;#u=new WeakMap;constructor(e){this.#t=e,e.addEventListener("seeking",this.#s),e.addEventListener("ratechange",this.#s)}get active(){return this.#o}append(e){if(this.#F)return;const t=new Uint8Array(e),i=new DataView(e);try{for(const r of _(t)){if(r.type==="moov"){this.#n=Ee(t,r);const h=this.#n;h&&VideoDecoder.isConfigSupported(h).then(o=>{this.#u.set(h,o.supported===!0)}).catch(o=>this.#m(o))}if(!(r.type!=="moof"||this.#n===null))for(const h of _(t,r.body,r.end).filter(o=>o.type==="traf")){const o=_(t,h.body,h.end),l=o.find(c=>c.type==="tfhd");if(!l||i.getUint32(l.body+4)!==1)continue;const u=o.find(c=>c.type==="tfdt"),a=o.find(c=>c.type==="trun");if(!u||!a||i.getUint32(u.body)!==16777216||i.getUint32(a.body)!==16781057)throw new Error("Unexpected mpeg2toh264 video fragment layout");let d=Number(i.getBigUint64(u.body+4)),x=r.start+i.getInt32(a.body+8);const f=i.getUint32(a.body+4);if(a.body+12+f*16>a.end)throw new Error("Incomplete video samples");for(let c=0;c<f;c++){const p=a.body+12+c*16,v=i.getUint32(p),b=i.getUint32(p+4),z=i.getUint32(p+8),We=i.getInt32(p+12);if(x<0||x+b>t.length)throw new Error("Video sample outside fragment");this.#h.push({config:this.#n,decodeTime:d/9e4,timestamp:Math.round((d+We)*1e6/9e4),duration:Math.round(v*1e6/9e4),type:z&65536?"delta":"key",data:t.subarray(x,x+b)}),d+=v,x+=b}}}const s=this.#t.buffered;if(s.length>0){let r=0;for(let h=0;h<(this.#o?this.#i:this.#h.length);h++){const o=this.#h[h];o.type==="key"&&o.timestamp/1e6<=s.start(0)&&(r=h)}r>0&&(this.#h.splice(0,r),this.#i=Math.max(0,this.#i-r))}}catch(s){this.#m(s)}}take(){if(this.#F||this.#t.playbackRate<=1.25||this.#n===null||this.#u.get(this.#n)!==!0){this.#o&&this.#s();return}this.#o||(this.#s(),this.#o=!0);const e=this.#t.currentTime;try{for(;this.#i<this.#h.length&&(this.#r?.decodeQueueSize??0)<6&&this.#v.length<12;){const i=this.#h[this.#i];if(i.decodeTime>e+.25)break;if(this.#e!==i.config){if(this.#r){if(!this.#E){this.#E=!0;const r=this.#r;r.flush().then(()=>{this.#r===r&&(r.close(),this.#r=null,this.#e=null,this.#E=!1)}).catch(h=>{this.#r===r&&this.#m(h)})}break}const s=new VideoDecoder({output:r=>{this.#r!==s?r.close():this.#l(r)},error:r=>{this.#r===s&&this.#m(r)}});this.#r=s,this.#r.configure(i.config),this.#e=i.config}(i.duration??0)<1e3&&this.#f.add(i.timestamp),this.#r.decode(new EncodedVideoChunk(i)),this.#i++}if(this.#g&&this.#i===this.#h.length&&this.#r&&!this.#E){this.#E=!0;const i=this.#r;i.flush().catch(s=>{this.#r===i&&this.#m(s)})}}catch(i){this.#m(i);return}const t=this.#v[0];return!t||t.timestamp/1e6>e+.003*this.#t.playbackRate?this.#a?null:void 0:(this.#a=!0,this.#v.shift())}#l=e=>{this.#f.delete(e.timestamp)||e.timestamp/1e6<this.#t.currentTime-(this.#a?.1:.04)?e.close():this.#v.push(e)};#s=()=>{this.#r&&this.#r.state!=="closed"&&this.#r.close(),this.#r=null,this.#e=null;for(const e of this.#v)e.close();this.#v=[],this.#f.clear(),this.#E=!1,this.#o=!1,this.#a=!1,this.#i=0;for(let e=0;e<this.#h.length;e++){const t=this.#h[e];t.type==="key"&&t.timestamp/1e6<=this.#t.currentTime&&(this.#i=e)}};finish(){this.#g=!0}suspend(){this.#s()}reset(){this.#s(),this.#h=[],this.#i=0,this.#n=null,this.#g=!1,this.#F=!1}destroy(){this.reset(),this.#t.removeEventListener("seeking",this.#s),this.#t.removeEventListener("ratechange",this.#s)}#m(e){this.#s(),this.#F=!0,console.warn("mpeg2toh264: decoded video input unavailable",e)}}const W=["mozParsedFrames","mozDecodedFrames","mozPresentedFrames","mozPaintedFrames"];function ye(n){return W.every(e=>e in n)}function Te(n){return n.ownerDocument?.defaultView?.performance.timeOrigin??performance.timeOrigin}const Fe=250,Re=500;class we{#t;#n;#e;#h=null;#i=null;#r=null;#v=null;#f=!1;#g=!0;#E=null;#F=null;#o=0;#a;#u;#l=!1;#s=null;#m=null;#D=null;#c=null;#y=0;#d=[];#R=!1;#B=0;#ne=[];#O=[];constructor(e,t){if(this.#t=e,this.#n=t,this.#e=ye(e)?e:null,this.#a=this.#e===null&&typeof VideoFrame<"u",this.#u=this.#a&&e.playbackRate>1,this.#e){for(const i of["emptied","seeking","seeked"])e.addEventListener(i,this.#N);for(const i of["pause","playing","waiting","ratechange"])e.addEventListener(i,this.#C)}if(this.#a)for(const i of["loadeddata","playing","pause","ended","seeking","seeked","emptied","ratechange"])e.addEventListener(i,this.#X)}get mozDriven(){return this.#e!==null&&!this.#u}get captureDriven(){return this.#u}get hasDelivered(){return this.#f}request(e){if(this.#i===null){if(this.#i=e,this.#u){this.#x();return}this.#h=this.#e?requestAnimationFrame(this.#w):this.#t.requestVideoFrameCallback(this.#z)}}recover(){this.#i===null||this.#u||this.#e||(this.#h!==null&&this.#t.cancelVideoFrameCallback(this.#h),this.#h=null,this.#a?(this.#l=!0,this.#u=!0,this.#x()):this.#h=this.#t.requestVideoFrameCallback(this.#z))}cancel(){this.#h!==null&&(this.#e?cancelAnimationFrame(this.#h):this.#t.cancelVideoFrameCallback(this.#h)),this.#h=null,this.#i=null,this.#s?.(),this.#s=null,this.#D!==null&&this.#t.cancelVideoFrameCallback(this.#D),this.#D=null,this.#ee(),this.#c=null,this.#d=[],this.#l=!1,this.#u=this.#a&&this.#t.playbackRate>1,this.#N()}destroy(){this.cancel();for(const e of["emptied","seeking","seeked"])this.#t.removeEventListener(e,this.#N);for(const e of["pause","playing","waiting","ratechange"])this.#t.removeEventListener(e,this.#C);for(const e of["loadeddata","playing","pause","ended","seeking","seeked","emptied","ratechange"])this.#t.removeEventListener(e,this.#X)}flush(e){if(this.#u)for(this.#t.ownerDocument!==this.#m&&(this.#s?.(),this.#s=null,this.#x());this.#O.length>0&&this.#i!==null;){const t=this.#O.shift(),i=t.frame;try{this.#L(e,{width:i.visibleRect?.width??i.codedWidth,height:i.visibleRect?.height??i.codedHeight,mediaTime:i.timestamp/1e6,presentedFrames:t.count,expectedDisplayTime:Math.max(t.at,e),timeOrigin:performance.timeOrigin,frame:i,pixels:t.pixels})}finally{i.close(),this.#i!==null&&t.pixels?.data.byteLength&&this.#ne.push(t.pixels.data)}}}#ee(){this.#B++;for(const e of this.#O)e.frame.close();this.#O=[],this.#ne=[]}#X=e=>{e.type==="emptied"&&(this.#l=!1);const t=this.#a&&(this.#t.playbackRate>1||this.#l);if(t!==this.#u){const i=this.#i;this.cancel(),this.#u=t,i!==null&&this.request(i);return}["seeking","seeked","emptied","ratechange"].includes(e.type)&&(this.#c=null,this.#d=[]),this.#u&&((e.type==="pause"||e.type==="ended")&&this.flush(performance.now()),this.#ee(),this.#s?.(),this.#s=null,this.#i!==null&&this.#x())};#x(){if(!this.#u||this.#s!==null||this.#i===null||this.#R||(this.#t.paused||this.#t.ended)&&this.#c!==null)return;this.#D===null&&typeof this.#t.requestVideoFrameCallback=="function"&&(this.#D=this.#t.requestVideoFrameCallback(this.#q));const e=Math.max(4,8/Math.max(1,this.#t.playbackRate)),t=this.#t.ownerDocument?.defaultView;if(this.#m=this.#t.ownerDocument,t){const i=t.setTimeout(this.#te,e);this.#s=()=>t.clearTimeout(i)}else{const i=setTimeout(this.#te,e);this.#s=()=>clearTimeout(i)}}#q=(e,t)=>{if(this.#l&&this.#t.playbackRate<=1){const i=this.#i;this.cancel(),this.#i=i,this.#z(e,t);return}this.#D=null,this.#s?.(),this.#s=null,this.#te()};#te=async()=>{this.#s=null;const e=this.#t;if(this.#i===null||this.#R)return;if(e.readyState<2||e.seeking){this.#x();return}let t,i=!1;try{const s=this.#n?.();if(s===null){this.#x();return}i=s!==void 0,t=s??new VideoFrame(e)}catch(s){if(!(s instanceof DOMException)||s.name!=="InvalidStateError")throw s;this.#x();return}if(t.timestamp===this.#c)t.close();else{let s;if(this.#l){const o=this.#B,l=t.visibleRect?.width??t.codedWidth,u=t.visibleRect?.height??t.codedHeight;let a=this.#ne.pop();a?.byteLength!==l*u*4&&(a=new Uint8ClampedArray(l*u*4)),this.#R=!0;try{await t.copyTo(a,{format:"RGBA"}),s=new ImageData(a,l,u)}catch(d){throw t.close(),d}finally{this.#R=!1}if(o!==this.#B||this.#i===null){t.close(),this.#x();return}}let r=1;if(this.#c!==null){const o=t.timestamp-this.#c;if(o>1e3&&o<25e4&&(this.#d.push(o),this.#d.length>7&&this.#d.shift()),o>0&&this.#d.length>0){const l=[...this.#d].sort((a,d)=>a-d),u=l[Math.floor(l.length/2)];r=Math.max(1,Math.round(o/u))}}this.#c=t.timestamp,this.#y+=r;const h=performance.now()+(i?(t.timestamp/1e6-e.currentTime)*1e3/e.playbackRate:0);for(this.#O.push({frame:t,pixels:s,at:h,count:this.#y});this.#O.length>4;)this.#O.shift().frame.close()}this.#x()};#C=()=>{this.#E=null,this.#F=null,this.#o=0};#N=()=>{this.#r=null,this.#v=null,this.#g=!0,this.#C()};#z=(e,t)=>{const i=Math.round(t.mediaTime*1e6);if(this.#c!==null){const s=t.presentedFrames-this.#y,r=i-this.#c;s>0&&r>1e3&&r<25e4&&(this.#d.push(r/s),this.#d.length>7&&this.#d.shift())}this.#c=i,this.#y=t.presentedFrames,this.#L(e,{width:t.width,height:t.height,mediaTime:t.mediaTime,presentedFrames:t.presentedFrames,expectedDisplayTime:t.expectedDisplayTime,timeOrigin:Te(this.#t)})};#L=(e,t)=>{const i=this.#i;this.#h=null,this.#i=null,this.#f=!0,i?.(e,t)};#w=e=>{const t=this.#e,i=W.map(o=>t[o]);this.#r?.some((o,l)=>i[l]<o)&&this.#N(),this.#r=i;const s=t.mozPaintedFrames,r=!t.seeking&&t.readyState>=2&&t.videoWidth>0&&t.videoHeight>0,h=this.#v===null&&(s>0||t.paused&&(t.mozPresentedFrames>0||t.mozDecodedFrames>0));if(r&&(h||this.#v!==null&&s!==this.#v)){if(this.#E!==null&&e-this.#E>Re&&(this.#C(),this.#g=!0),!t.paused&&!t.ended){const l=this.#F;if(l&&e-l.at>=Fe){const u=s-l.frames;if(u>0){const a=(e-l.at)/u;a>=4&&a<=200&&(this.#o=this.#o?this.#o+(a-this.#o)*.25:a)}this.#F=null}this.#F??={at:e,frames:s}}this.#E=e,this.#v=s;const o=this.#g;this.#g=!1,this.#L(e,{width:t.videoWidth,height:t.videoHeight,mediaTime:t.currentTime,presentedFrames:s,expectedDisplayTime:e,timeOrigin:performance.timeOrigin,mozTiming:{periodMs:this.#o,discontinuity:o}})}else this.#h=requestAnimationFrame(this.#w)}}let _e=null;const q=.5,y=4,O=5,A=O+1,K=1e3,Q=4,B=200,Ae=.25,ke=1e3/60,Se=250,Ce=`#version 300 es
void main() {
  // One triangle over the whole viewport, from the vertex index alone. There
  // is no geometry here worth a buffer: every pixel is the fragment shader's.
  vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`,De=.75,Pe=.1,j=1,Me=.02,Le=.1,Y=1,Be=4,N=5,Ue=4,Ie={2:0,3:.25,4:.5,5:.75},Oe=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform bool uFlip;
out vec4 fragColor;
void main() {
  ivec2 position = ivec2(gl_FragCoord.xy);
  if (uFlip) position.y = textureSize(uField, 0).y - 1 - position.y;
  fragColor = texelFetch(uField, position, 0);
}
`,Ne={requestAnimationFrame:n=>requestAnimationFrame(n),cancelAnimationFrame:n=>cancelAnimationFrame(n)};class ze extends EventTarget{encodedVideo;#t;#n;#e;#h;#i;#r=null;#v;#f;#g;#E;#F;#o=[];#a=[];#u=A-1;#l=null;#s=[];#m=null;#D=0;#c=null;#y=null;#d;#R=ke;#B=0;#ne=0;#O=0;#ee=0;#X=null;#x(){this.#s.length=0,this.#X=null,this.#ee=0}#q=null;#te;#C;#N;#z=0;#L;#w;#_=0;#U=0;#$=0;#I=y-1;#A=0;#Te=0;#Ke=0;#Fe=!1;#Qe=0;#k=!1;#ie=0;#Ue=!1;#V=!1;#T=null;#he=[];#G=!1;#je;#Ye;#S;#oe;#K;#Je;#p=null;#b;#Re=!1;#Ze=0;#et=!1;#Vt=0;#we=!1;#Ie=!1;#ae=null;#Ht=0;#_e=new Map;#P={filtered:0,missed:0,degraded:0,discontinuities:0,resynced:0,late:0,queueResetted:0};#Ae=0;#Oe=0;#Ne=0;#Q=0;#le=0;#ce=0;#ke=0;#ue=0;#fe;#ze=[];#de=[];#Se=0;#me=0;#Ce=0;#pe=0;#De=w;#ve=0;#M=w;#j=!1;#xe=null;#Et="";#Ge=[0,0,0,0,0,0];#tt=0;#se=null;#it=null;#st=0;constructor(e,t={},i=null){super(),this.#e=e,this.#C=t.doubleRate??!1,this.#N=t.spatialCheck??!0,this.#L=t.debug??!1,this.#w=t.film??!1,this.#je=t.onStats,this.#Ye=t.onFailure,this.#S=i,this.#K=i?"main":t.rendering??"main",this.#Je=t.workerUrl??_e,this.#b=this.#K==="main"?"main":"idle",this.#n=i?i.canvas:document.createElement("canvas"),this.#t=i?.canvas??(this.#K==="main"?this.#n:document.createElement("canvas")),this.#oe=e,i||(this.#n.style.cssText="position:absolute;pointer-events:none;visibility:hidden");const s=this.#t.getContext("webgl2",{alpha:!0,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance"});if(!(s instanceof WebGL2RenderingContext))throw new Error("this browser has no WebGL2");this.#i=s,this.#w&&(this.#Ft(),this.#r=new H(s)),this.#v=J(s,be);const r=this.#v;this.#f=Object.fromEntries(Object.entries(xe).map(([h,o])=>[h,s.getUniformLocation(r,o)])),this.#g=J(s,Oe),this.#E=s.getUniformLocation(this.#g,"uField"),this.#F=s.getUniformLocation(this.#g,"uFlip"),this.#fe=s.getExtension("EXT_disjoint_timer_query_webgl2"),this.#t.addEventListener("webglcontextlost",this.#$t),this.#te=i?null:new ResizeObserver(()=>this.#Le()),this.#d=i?null:new MutationObserver(()=>{this.#n.ownerDocument!==this.#y&&this.#Le()}),this.encodedVideo=!i&&typeof VideoDecoder<"u"?new ge(e):null,this.#h=new we(e,()=>this.encodedVideo?.take()),e.addEventListener("emptied",this.#zt),e.addEventListener("resize",this.#Nt),e.addEventListener("pause",this.#Z),e.addEventListener("ended",this.#Z),e.addEventListener("seeking",this.#Xt),e.addEventListener("seeked",this.#Z),e.addEventListener("ratechange",this.#Z)}get running(){return this.#k&&(this.#T?.interlaced??!0)}get canvas(){return this.#n}get#gt(){return this.#T?.topFieldFirst!==!1}#yt(){return{doubleRate:this.#C,spatialCheck:this.#N,film:this.#w,debug:this.#L}}get enabled(){return this.#Ue}set enabled(e){this.#Ue=e,this.#rt(),this.#p?.postMessage({type:"enabled",enabled:e})}set scan(e){const t=this.#T?.interlaced!==e?.interlaced,i=t||this.#T?.topFieldFirst!==e?.topFieldFirst;this.#T=e,!(i&&(!this.#Ee()||this.#T!==e))&&(this.#p?.postMessage({type:"scan",scan:e}),i&&(this.#A=0,this.#x(),this.#H(),t&&(this.#_=0),this.#l=null,this.#J(!1)),this.#rt(),i&&((e?.interlaced??!0)&&(this.#S||this.#b==="main")?this.#Me():this.#ut()))}get scan(){return this.#T}set videoTimeline(e){this.#he=e,this.#p?.postMessage({type:"timeline",videoTimeline:e}),e.length===0&&(this.#T=null),this.#rt()}get videoTimeline(){return this.#he}get container(){return this.#q??this.#e}get doubleRate(){return this.#C}set doubleRate(e){e!==this.#C&&(this.#C=e,this.#be(),this.#x(),this.#Tt())}get spatialCheck(){return this.#N}set spatialCheck(e){e!==this.#N&&(this.#N=e,this.#be())}get film(){return this.#w}set film(e){const t=this.#p?this.#it:this.#se;if(!(e===this.#w&&(e===!1||t===null))){if(this.#p){this.#w=e,this.#be(e?"film":void 0);return}if(e){if(!this.#Ee())return;try{this.#Rt()}catch(i){this.#w=!0,this.#be(),this.#ht(`film detector unavailable: ${i instanceof Error?i.message:String(i)}`);return}}if(this.#w=e,this.#be(),!e){if(!this.#Ee())return;this.#j=!1,this.#M=w,this.#H(),this.#r?.destroy(),this.#r=null}this.#Tt()}}get debug(){return this.#L}set debug(e){e!==this.#L&&(this.#L=e,this.#be())}get#Wt(){return this.#C||this.#w}#Tt(){this.#V||(this.#Wt?(this.#U>0&&this.#Ot(),(this.#T?.interlaced??!0)&&(this.#S||this.#b==="main")&&this.#Me()):this.#w||(this.#l=null,this.#J(!1),this.#Be()))}#be(e){this.#p?.postMessage({type:"settings",options:this.#yt(),retryFilm:e})}#Ft(){if(this.#i.getExtension("EXT_color_buffer_float")===null)throw new Error("film needs EXT_color_buffer_float")}#Rt(){this.#Ft(),this.#r??=new H(this.#i),this.#U>0&&this.#r.resize(this.#U,this.#$)}#rt(){this.#Ue&&(this.#he.length>0||(this.#T?.interlaced??!0))?this.start():this.stop()}#qt(){return this.#S||this.#K==="main"?!1:this.#b==="starting"||this.#b==="active"?!0:typeof Worker<"u"&&typeof VideoFrame<"u"&&typeof OffscreenCanvas<"u"&&this.#Je!==null&&"transferControlToOffscreen"in HTMLCanvasElement.prototype?(this.#wt(),!0):this.#K==="auto"?(this.#Xe(),!1):(this.#b="failed",this.#k=!1,!0)}#wt(){this.#Y(),this.#p?.terminate(),this.#p=null,this.#we=!1,this.#Ie=!1,this.#it=null,this.#st=0;let e=this.#n;if(this.#et){e=document.createElement("canvas"),e.className=this.#n.className;const r=this.#n.getAttribute("style");r===null?e.removeAttribute("style"):e.setAttribute("style",r),e.style.visibility="hidden",this.#n.parentElement&&this.#n.replaceWith(e),this.#n=e}const t=++this.#Ze;this.#b="starting";let i,s;try{s=e.transferControlToOffscreen(),this.#et=!0,i=new Worker(this.#Je,{type:"module"})}catch(r){this.#Pe(r instanceof Error?r.message:String(r));return}this.#p=i,i.onmessage=r=>{t===this.#Ze&&this.#Kt(r.data)},i.onerror=r=>{t===this.#Ze&&(r.preventDefault(),this.#Pe(r.message||"the deinterlacer worker failed"))},i.postMessage({type:"initialize",canvas:s,options:this.#yt(),scan:this.#T,videoTimeline:this.#he,enabled:this.#k,video:this.#ot()},[s])}#Kt(e){switch(e.type){case"ready":this.#b="active",this.#k&&(this.#ge(),this.#pt());break;case"failed":this.#Pe(e.message);break;case"consumed":{this.#we=!1,this.#Ie=!0;const t=this.#ae;this.#ae=null,t&&this.#At(t);break}case"visibility":this.#n.style.visibility=e.visible?"visible":"hidden";break;case"stats":{const t={...e.stats,dropped:this.#e.getVideoPlaybackQuality?.().droppedVideoFrames??0},i=t.filmError??null,s=this.#st;if(this.#it=i,this.#st=e.filmFailure,i!==null&&e.filmFailure!==s){this.dispatchEvent(new CustomEvent("failure",{detail:i}));try{this.#Ye?.(i)}catch{}}this.dispatchEvent(new CustomEvent("stats",{detail:t})),this.#je?.(t);break}case"capture":{const t=this.#_e.get(e.id);if(this.#_e.delete(e.id),!t){e.image?.close();break}e.image?t.resolve(e.image):createImageBitmap(this.#e).then(t.resolve,t.reject);break}}}#nt(e){if(this.dispatchEvent(new CustomEvent("failure",{detail:e})),!this.#S)try{this.#Ye?.(e)}catch{}}#ht(e){this.#se!==e&&(this.#se=e,this.#j=!1,this.#M=w,this.#H(),this.#r?.destroy(),this.#r=null,this.#nt(e))}#Ee(){return this.#V?!1:(this.#p||(this.#se=null),!0)}#Pe(e){if(this.#b==="starting"&&this.#K==="auto"&&!this.#Re){this.#Xe();return}if(this.#_t(e),!this.#Re){this.#Re=!0,this.#wt();return}console.error(`Deinterlacer Worker stopped: ${e}`),this.#b="failed",this.#p?.terminate(),this.#p=null,this.#Y(),this.#nt(`deinterlacer worker stopped: ${e}`),this.stop()}#Xe(){const e=this.#t;e.className=this.#n.className;const t=this.#n.getAttribute("style");t===null?e.removeAttribute("style"):e.setAttribute("style",t),e.style.visibility="hidden",this.#n.parentElement&&this.#n.replaceWith(e),this.#n=e,this.#et=!1,this.#p?.terminate(),this.#p=null,this.#b="main",this.#Y(),this.#k&&(this.#ge(),this.#pt(),(this.#T?.interlaced??!0)&&this.#Me())}#Y(){this.#ae?.frame.close(),this.#ae=null}#_t(e){for(const t of this.#_e.values())t.reject(new Error(e));this.#_e.clear()}start(){if(!(this.#k||this.#V||this.#G)&&(this.#ie++,this.#k=!0,this.#Gt(),!!this.#Ee())){if(this.#Qe=performance.now(),this.#fi(),this.#pt(),this.#qt()){this.#p?.postMessage({type:"enabled",enabled:!0}),this.#b==="active"&&this.#ge();return}this.#ge(),(this.#T?.interlaced??!0)&&this.#Me()}}stop(){this.#ie++,this.#k&&(this.#k=!1,this.#h.cancel(),this.encodedVideo?.suspend(),this.#hi(),this.#ut(),this.#A=0,this.#l=null,this.#J(!1),this.#Y(),this.#p?.postMessage({type:"enabled",enabled:!1}))}destroy(){if(!this.#V){this.#V=!0,this.#Ue=!1,this.stop(),this.#p?.postMessage({type:"destroy"}),this.#p?.terminate(),this.#p=null,this.#Y(),this.#_t("the deinterlacer was destroyed"),this.#y?.removeEventListener("visibilitychange",this.#mt),this.#y=null,this.#d?.disconnect(),this.#t.removeEventListener("webglcontextlost",this.#$t),this.#h.destroy(),this.encodedVideo?.destroy(),this.#e.removeEventListener("emptied",this.#zt),this.#e.removeEventListener("resize",this.#Nt),this.#e.removeEventListener("pause",this.#Z),this.#e.removeEventListener("ended",this.#Z),this.#e.removeEventListener("seeking",this.#Xt),this.#e.removeEventListener("seeked",this.#Z),this.#e.removeEventListener("ratechange",this.#Z),this.#di();for(const e of this.#o)this.#i.deleteTexture(e);this.#o=[],this.#Be();for(const e of[...this.#ze,...this.#de.map(({q:t})=>t)])this.#i.deleteQuery(e);this.#ze.length=0,this.#de.length=0,this.#r?.destroy(),this.#r=null,this.#xe!==null&&(ne(this.#xe),this.#xe=null),this.#i.deleteProgram(this.#v),this.#i.deleteProgram(this.#g),this.#i.getExtension("WEBGL_lose_context")?.loseContext()}}capture(){if(this.#b==="active"&&this.#n.style.visibility==="visible"&&this.#p){const s=++this.#Ht,r=new Promise((h,o)=>{this.#_e.set(s,{resolve:h,reject:o})});return this.#p.postMessage({type:"capture",id:s,width:this.#e.videoWidth,height:this.#e.videoHeight}),r}if(this.#b==="starting"||this.#b==="failed")return createImageBitmap(this.#e);const e=this.#l;if(this.#S&&(!this.#k||this.#G||!e))return Promise.reject(new Error("no rendered picture is available"));if(!this.#k||this.#G||!e)return createImageBitmap(this.#e);e.kind==="texture"?this.#xt(e.texture,e.flip,!1):this.#re(e.flush,e.second,null,!1);const t=this.#e.videoWidth,i=this.#e.videoHeight;return t>0&&i>0&&(t!==this.#t.width||i!==this.#t.height)?createImageBitmap(this.#t,{resizeWidth:t,resizeHeight:i,resizeQuality:"high"}):createImageBitmap(this.#t)}addEventListener(e,t,i){super.addEventListener(e,t,i)}removeEventListener(e,t,i){super.removeEventListener(e,t,i)}#ge(){this.#S||!this.#k||this.#h.request(this.#ti)}#ot(){const e=[];for(let t=0;t<this.#e.buffered.length;t++)e.push({start:this.#e.buffered.start(t),end:this.#e.buffered.end(t)});return{currentTime:this.#e.currentTime,playbackRate:this.#e.playbackRate,seeking:this.#e.seeking,paused:this.#e.paused,ended:this.#e.ended,readyState:this.#e.readyState,videoWidth:this.#e.videoWidth,videoHeight:this.#e.videoHeight,buffered:e}}#Qt(e,t,i,s){let r;try{r=i?.clone()??new VideoFrame(this.#e,{timestamp:Math.max(0,Math.round(t.mediaTime*1e6))})}catch(o){const l=o instanceof Error?o.message:String(o);this.#K==="auto"&&!this.#Ie&&!this.#Re?(this.#Xe(),this.#Ve(e,t)):this.#Pe(l);return}const h={id:++this.#Vt,frame:r,pixels:s?new ImageData(s.data.slice(),s.width,s.height):void 0,now:e,metadata:t,video:this.#ot()};if(this.#we){this.#ae?.frame.close(),this.#ae=h;return}this.#At(h)}#At(e){const t=this.#p;if(!t||this.#b!=="active"){e.frame.close();return}this.#we=!0;const i={type:"frame",id:e.id,frame:e.frame,pixels:e.pixels,metadata:e.metadata,video:e.video};try{t.postMessage(i,[e.frame,...e.pixels?[e.pixels.data.buffer]:[]])}catch(s){this.#we=!1,e.frame.close();const r=s instanceof Error?s.message:String(s);this.#K==="auto"&&!this.#Ie&&!this.#Re?(this.#Xe(),this.#Ve(e.now,e.metadata)):this.#Pe(r)}}#jt(e,t,i){this.#xe==null&&(this.#xe=se(this.#i,"20px monospace")),he(this.#xe,e,t,i,this.#U,this.#$,20)}#kt(e){if(this.#fe==null||this.#de.length>30)return;const t=this.#ze.pop()??this.#i.createQuery();return this.#i.beginQuery(this.#fe.TIME_ELAPSED_EXT,t),this.#de.push({q:t,isField:e}),t}#$e(e){this.#fe!=null&&(e!=null&&this.#i.endQuery(this.#fe.TIME_ELAPSED_EXT),this.#de=this.#de.filter(({q:t,isField:i})=>{if(this.#i.getQueryParameter(t,this.#i.QUERY_RESULT_AVAILABLE)){const s=this.#i.getQueryParameter(t,this.#i.QUERY_RESULT);return i?(this.#Ce+=s,this.#pe++):(this.#Se+=s,this.#me++),this.#ze.push(t),!1}return!0}))}#H(){this.#M=w,this.#De=w,this.#ve=0,this.#j=!1,this.#r?.reset()}#Yt(){const{prev:e,cur:t,next:i}=this.#Ut(!1),s=this.#o[e],r=this.#o[t],h=this.#o[i];if(!s||!r||!h)return;const o=this.#T?.topFieldFirst!==!1?0:1;this.#r?.detect(r,h,o),this.#r?.measureComb(s,r,o)}#Jt(){const e=this.#r?.poll()??null;e!==null&&(this.#De=e,this.#ve=e.age),this.#ve++;const{phase:t,run:i}=this.#De;t===0||this.#ve>Math.ceil(N*Math.max(1,this.#e.playbackRate))?this.#M=w:this.#M={phase:(t-1+this.#ve)%N+1,run:i}}#Zt(e){const t=[],i=this.#r?.metrics??new Float32Array(0);for(let r=0;r<m.phase;r++){const h=i[r*4]??0,o=i[r*4+1]??0,l=i[r*4+2]??0;t.push(`${h.toFixed(3)},${o.toString().padStart(4)},${l.toFixed(3)}`)}const s=this.#Ge.map((r,h)=>`${h===0?"-":h}:${r}`).join(" ");return`frame=${e} phase=${this.#M.phase} run=${this.#M.run} known=${this.#De.phase}/${this.#De.run} age=${this.#ve} ${this.#j?"film":"video"} period=${this.#_.toFixed(3)}
${t.join(" ")}
${s} dropped:${this.#tt}`}#at(e,t){const i=t-performance.timeOrigin;return Number.isFinite(i)&&i!==0?e+i:e}#ei(e,t){const i=e.expectedDisplayTime;if(!Number.isFinite(i)||i<=0||!Number.isFinite(e.timeOrigin))return t;const s=this.#at(i,e.timeOrigin),r=Be*Math.max(this.#R,this.#_);return s<t-r||s>t+r?t:s}#ti=(e,t)=>{if(!this.#k||this.#G)return;this.#dt();const i=this.#at(e,t.timeOrigin);this.#Qe=i;const{frame:s,pixels:r,...h}=t;this.#oe=r??s??this.#e;try{this.#ii(i,h,s,r)}finally{this.#oe=this.#e}this.#ge()};#ii(e,t,i,s){if(this.#b==="active"){this.#Qt(e,t,i,s);return}this.#b!=="starting"&&this.#Ve(e,t)}ingestExternalFrame(e,t,i,s){this.#oe=s??i;try{this.#Ve(e,t)}finally{this.#oe=this.#e}}#Ve(e,t){const i=this.#ie;if(this.#W(i)&&(this.#si(t.mediaTime),!!this.#W(i)&&t.width>0&&t.height>0)){let s=!1;if(!this.#Fe&&this.#e.seeking){const c=this.#e.buffered,p=this.#_>=Q?this.#_/1e3:B/1e3;for(let v=0;v<c.length;v++)if(t.mediaTime>=c.start(v)&&t.mediaTime<c.end(v)&&Math.abs(t.mediaTime-this.#e.currentTime)<=p){s=!0;break}}if(s&&(this.#Fe=!0),(this.#U===0||this.#$===0)&&this.#It(t.width,t.height),!this.#W(i))return;if(this.#T&&!this.#T.interlaced){const c=performance.now();this.#Mt(c),this.#Oe=c,this.#ci(),this.#le+=performance.now()-c,this.#Q++,this.#ce++,this.#Lt(c);return}const r=t.mediaTime-this.#Te,h=t.mozTiming,o=s||(h?h.discontinuity||r<0||r>q:r<0||r>q);o&&(this.#A=0,this.#_=0,this.#P.discontinuities++,this.#x(),this.#H());const l=this.#ui(t.presentedFrames,o);if(this.#A>0&&t.mediaTime===this.#Te&&(!h||t.presentedFrames===this.#Ke))return;if(!o){const c=h?.periodMs??0;c>0?this.#St(c*(this.#e.playbackRate||1)/1e3,1):this.#A>0&&r>0&&this.#St(r,l+1)}this.#Te=t.mediaTime,this.#Ke=t.presentedFrames;const u=performance.now();this.#Mt(u),this.#Oe=u;const a=performance.now(),d=this.#kt(!1);if(this.#Bt(),this.#w&&!this.#se&&!this.#r)try{this.#Rt()}catch(c){this.#ht(`film detector unavailable: ${c instanceof Error?c.message:String(c)}`)}if(!this.#W(i)){this.#V||this.#$e(d);return}if(this.#w&&!this.#se){if(this.#A===y&&l===0)try{this.#Jt(),this.#Yt()}catch(c){this.#ht(`film detection failed: ${c instanceof Error?c.message:String(c)}`)}else this.#H();this.#Ge[this.#M.phase]=(this.#Ge[this.#M.phase]??0)+1,this.#j=this.#M.phase!==0&&this.#M.run>=I,this.#L&&(this.#Et=this.#Zt(t.presentedFrames))}if(!this.#W(i)){this.#V||this.#$e(d);return}const f=this.#ei(t,e)+this.#R;if(this.#j)if(this.#He()){const c=this.#M.phase;if(c===U)this.#tt++,this.#ee++;else{const p=this.#_*N/Ue,v=this.#ct(1,e,p),b=Ie[c]??0,z=v||this.#X===null?f+p:f+b*this.#_;this.#We("film",!1,this.#lt("film",z,p),p)}}else this.#re(!1,!1,null);else if(this.#C&&this.#He()){const c=this.#_/2,v=this.#ct(2,e,c)||this.#X===null?f+c*2:f,b=this.#lt("field",v,c);this.#We("field",!1,b,c),this.#We("field",!0,b+c,c)}else if(this.#He()){const c=this.#_,v=this.#ct(1,e,c)||this.#X===null?f+c:f;this.#We("frame",!1,this.#lt("frame",v,c),c)||(this.#P.late++,this.#re(!1,!1,null))}else this.#P.late+=this.#s.length,this.#x(),this.#re(!1,!1,null);this.#ue=Math.max(this.#ue,this.#s.length),this.#$e(d),this.#le+=performance.now()-a,this.#Q++,this.#Lt(u)}}#W(e){return!this.#V&&this.#k&&e===this.#ie}#si(e){const t=this.#ie;let i;for(let h=this.#he.length-1;h>=0;h--){const o=this.#he[h];if(o.start<=e+1e-6){i=o;break}}if(i?.codedSize&&(i.codedSize.width!==this.#U||i.codedSize.height!==this.#$)&&this.#It(i.codedSize.width,i.codedSize.height),!this.#W(t))return;const s=i?.scan;if(!s||this.#T?.interlaced===s.interlaced&&this.#T.topFieldFirst===s.topFieldFirst)return;const r=this.#T?.interlaced;this.#T=s,this.#A=0,this.#x(),this.#Ee()&&(r!==s.interlaced&&(this.#_=0),s.interlaced&&(this.#S||this.#b==="main")?this.#Me():this.#ut(),this.#H())}#He(){return(this.#C||this.#w)&&this.#_>0&&this.#a.length===A}#St(e,t){const s=e*1e3/(this.#e.playbackRate||1)/t;s<Q||s>B||(this.#_=this.#_>0&&s>this.#_*De?this.#_+(s-this.#_)*Ae:s)}#We(e,t,i,s){const r=this.#Ct();if(r===null)return!1;const h=this.#a[r];if(!h)return!1;for(this.#u=r;this.#s.length>0&&this.#s[0]?.slot===r;)this.#s.shift(),this.#P.late++;this.#re(!1,t,h.framebuffer);const o={slot:r,at:i,duration:s,cadence:e,phase:e==="film"?this.#M.phase:e==="field"?t?2:1:0,droppedBefore:this.#ee};return this.#ee=0,this.#s.push(o),this.#X=o,!0}#lt(e,t,i){if(!(i>0))return t;const s=this.#X;if(s!==null&&s.cadence===e){const r=s.at+s.duration,h=t-r;if(Math.abs(h)<i){const o=Math.max(-j,Math.min(j,h*Pe));return r+o}}s!==null&&this.#P.resynced++;for(let r=this.#s.at(-1);r&&r.at>=t;)this.#s.pop(),this.#P.late++,r=this.#s.at(-1);return t}#ct(e,t,i){const s=this.#s.at(-1),r=(O+1)*Math.max(this.#R,i);if(s&&s.at-t>r)return this.#x(),this.#P.queueResetted++,!0;const h=Math.max(0,this.#s.length+e-O);let o=0,l=0;for(;l<h;){const u=this.#s.shift();if(!u)break;o+=u.duration,l++}for(const u of this.#s)u.at-=o;return this.#P.late+=l,!1}#Ct(){const e=this.#l?.kind==="texture"?this.#l.texture:null,t=new Set(this.#s.map(({slot:s})=>s));for(let s=1;s<=A;s++){const r=(this.#u+s)%A,h=this.#a[r];if(h&&h.texture!==e&&!t.has(r))return r}const i=this.#s[0];if(i){const s=this.#a[i.slot];if(s&&s.texture!==e)return i.slot}return null}#Me(){this.#m===null&&(!this.#k||this.#G||(this.#D=0,this.#m=this.#ye(this.#ft)))}#ut(){this.#qe(this.#m),this.#m=null,this.#x()}#ft=e=>{if(this.#m=null,!this.#k||this.#G)return;this.#ri(e);const t=this.#ie;this.#h.flush(e),this.#W(t)&&(this.#b==="main"&&this.#ai(this.#B,e),this.#m=this.#ye(this.#ft))};#ri(e){const t=e-this.#D;this.#D=e;const i=Math.max(1,Math.round(t/this.#R)),s=this.#B+i*this.#R,r=e-s;if(this.#B===0||t<=0||t>B||Math.abs(r)>this.#R/4){t>=1&&t<=B&&(this.#R=t),this.#B=e;return}this.#R+=r/i*Me,this.#B=s+r*Le}#Dt(){const e=this.#S;if(e)return{frames:e,origin:performance.timeOrigin};const t=this.#n.ownerDocument?.defaultView??this.#e.ownerDocument?.defaultView??null;return t===null?{frames:Ne,origin:performance.timeOrigin}:{frames:t,origin:t.performance.timeOrigin}}#ye(e){const{frames:t,origin:i}=this.#Dt(),s=t.requestAnimationFrame(r=>e(this.#at(r,i)));return{frames:t,handle:s}}#qe(e){e?.frames.cancelAnimationFrame(e.handle)}#dt(){if(this.#S)return;this.#ni();const{frames:e}=this.#Dt(),t=this.#m!==null&&this.#m.frames!==e,i=this.#c!==null&&this.#c.frames!==e;!t&&!i||(this.#D=0,t&&(this.#qe(this.#m),this.#m=this.#ye(this.#ft)),i&&(this.#qe(this.#c),this.#c=this.#ye(this.#vt)))}#ni(){const e=this.#S?null:this.#n.ownerDocument??null;e!==this.#y&&(this.#y?.removeEventListener("visibilitychange",this.#mt),this.#y=e,e?.addEventListener("visibilitychange",this.#mt),this.#d?.disconnect(),e&&this.#d?.observe(e,{childList:!0,subtree:!0}))}#mt=()=>{this.#V||this.#dt()};#pt(){this.#S||this.#c!==null||!this.#k||this.#G||(this.#c=this.#ye(this.#vt))}#hi(){this.#qe(this.#c),this.#c=null}#vt=e=>{if(this.#c=null,!this.#k||this.#G)return;const t=this.#ie;this.#h.flush(e),this.#W(t)&&(this.#oi(e),this.#W(t)&&(this.#c=this.#ye(this.#vt)))};#oi(e){this.#S||this.#h.captureDriven||this.#h.mozDriven&&this.#h.hasDelivered||e-this.#Qe<Se||this.#e.playbackRate===0||this.#e.paused||this.#e.ended||this.#e.readyState<2||(this.#ge(),this.#h.recover())}#ai(e,t){const i=this.#R/2,s=l=>{const u=l.at-e;return u<=i-Y?!0:u>i+Y?!1:this.#ne>0};for(;this.#s[1]&&s(this.#s[1]);)this.#P.late++,this.#s.shift();const r=this.#s[0];if(!r||!s(r))return;this.#s.shift(),this.#ne=r.at-e;const h=performance.now(),o=this.#kt(!0);this.#Pt(r.slot),this.#$e(o),this.#ke+=performance.now()-h,this.#ce++,this.#L&&this.#li(r,t),this.#O=t}#li(e,t){const i=this.#O===0?0:t-this.#O,s=i/this.#R,r=e.cadence==="film"?`phase ${e.phase}`:e.cadence==="field"?`field ${e.phase}`:"frame",h=e.phase===0?"duplicate":`phase ${U}`,o=e.droppedBefore>0?`, ${h} dropped before it`+(e.droppedBefore>1?` (${e.droppedBefore})`:""):"";console.log(`yadif: +${i.toFixed(2)} ms (${s.toFixed(2)} refreshes) ${e.cadence} ${r}, due ${(e.at-t).toFixed(2)} ms${o}`)}#Pt(e){const t=this.#a[e];t&&this.#xt(t.texture)}#ci(){this.#Bt();const e=this.#o[this.#I];e&&this.#xt(e,!0),this.#A=0}#J(e){if(this.#S){this.#S.onVisibility(e);return}this.#n.style.visibility=e?"visible":"hidden"}#xt(e,t=!1,i=!0){const s=this.#i;s.bindFramebuffer(s.FRAMEBUFFER,null),s.useProgram(this.#g),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,e),s.uniform1i(this.#E,0),s.uniform1i(this.#F,t?1:0),s.viewport(0,0,this.#U,this.#$),s.drawArrays(s.TRIANGLES,0,3),this.#l={kind:"texture",texture:e,flip:t},this.#J(!0),i&&this.#z++}#ui(e,t){let i=0;return this.#Ae!==0&&!t&&(i=Math.max(0,e-this.#Ae-1),this.#P.missed+=i),this.#Ae=e,i}#Mt(e){e-this.#Oe<=K||(this.#Ne=e,this.#Q=0,this.#le=0,this.#ce=0,this.#ke=0,this.#ue=0,this.#z=0,this.#Se=0,this.#me=0,this.#Ce=0,this.#pe=0)}#Lt(e){const t=e-this.#Ne;if(t<K)return;const i=this.#He()&&(this.#C||this.#j)?this.#ce:this.#Q,s=this.#Q?(this.#le+this.#ke)/this.#Q:0;let r;this.#fe!=null&&(r=0,this.#me!==0&&(r+=this.#Se/1e6/this.#me),this.#pe!==0&&(r+=this.#Ce/1e6/this.#pe/2));const h={...this.#P,dropped:this.#e.getVideoPlaybackQuality?.().droppedVideoFrames??0,fps:i*1e3/t,frameMs:s,maxQueuedFields:this.#ue,outputFps:this.#z*1e3/t,gpuMs:r,film:this.#j,filmError:this.#se};this.dispatchEvent(new CustomEvent("stats",{detail:h})),this.#je?.(h),this.#Ne=e,this.#Q=0,this.#le=0,this.#ce=0,this.#ke=0,this.#ue=0,this.#z=0,this.#Se=0,this.#me=0,this.#Ce=0,this.#pe=0}#Bt(){const e=this.#i;this.#I=(this.#I+1)%y,e.bindTexture(e.TEXTURE_2D,this.#o[this.#I]??null),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,this.#oe),this.#A=Math.min(this.#A+1,y)}#re(e,t,i,s=!0){if(this.#A===0||this.#G)return;s&&(this.#A===y&&!e?this.#P.filtered++:this.#P.degraded++);const r=this.#i,{prev:h,cur:o,next:l}=this.#Ut(e);r.bindFramebuffer(r.FRAMEBUFFER,i),r.useProgram(this.#v);for(const[f,c]of[h,o,l].entries())r.activeTexture(r.TEXTURE0+f),r.bindTexture(r.TEXTURE_2D,this.#o[c]??null);r.uniform1i(this.#f.prev,0),r.uniform1i(this.#f.cur,1),r.uniform1i(this.#f.next,2);const u=this.#w?this.#r?.texture??null:null,a=this.#w?this.#r?.combTexture??null:null,d=u!==null&&a!==null;u!==null&&a!==null&&(r.activeTexture(r.TEXTURE0+3),r.bindTexture(r.TEXTURE_2D,u),r.uniform1i(this.#f.fieldMetrics,3),r.activeTexture(r.TEXTURE0+4),r.bindTexture(r.TEXTURE_2D,a),r.uniform1i(this.#f.comb,4)),r.uniform2i(this.#f.size,this.#U,this.#$);const x=this.#gt?0:1;r.uniform1i(this.#f.parity,t?1-x:x),r.uniform1i(this.#f.tff,this.#gt?1:0),r.uniform1i(this.#f.second,t?1:0),r.uniform1i(this.#f.spatialCheck,this.#N?1:0),r.uniform1i(this.#f.debug,this.#L?1:0),r.uniform1i(this.#f.film,d?1:0),r.uniform1i(this.#f.phase,this.#M.phase),r.viewport(0,0,this.#U,this.#$),r.drawArrays(r.TRIANGLES,0,3),this.#L&&d&&this.#jt(this.#Et,0,90),i===null&&(this.#l={kind:"yadif",flush:e,second:t},this.#J(!0),s&&this.#z++)}#Ut(e){const t=i=>(this.#I+y-i)%y;return this.#A===1?{prev:this.#I,cur:this.#I,next:this.#I}:e?{prev:t(1),cur:this.#I,next:this.#I}:this.#A===2?{prev:t(1),cur:t(1),next:this.#I}:{prev:t(2),cur:t(1),next:this.#I}}#Le(){if(this.#dt(),!this.#q)return;const e=this.#e,t=e.videoWidth,i=e.videoHeight;if(t===0||i===0)return;const s=Math.min(e.offsetWidth/t,e.offsetHeight/i),r=t*s,h=i*s;this.#n.style.left=`${e.offsetLeft+(e.offsetWidth-r)/2}px`,this.#n.style.top=`${e.offsetTop+(e.offsetHeight-h)/2}px`,this.#n.style.width=`${r}px`,this.#n.style.height=`${h}px`}#It(e,t){const i=this.#i;this.#t.width=e,this.#t.height=t,this.#U=e,this.#$=t,this.#A=0,this.#l=null,this.#x(),this.#Le();for(const s of this.#o)i.deleteTexture(s);this.#o=[];for(let s=0;s<y;s++){const r=i.createTexture();i.bindTexture(i.TEXTURE_2D,r),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.NEAREST),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,e,t,0,i.RGBA,i.UNSIGNED_BYTE,null),this.#o.push(r)}this.#Be(),(this.#C||this.#w)&&this.#Ot(),this.#r?.resize(e,t),this.#Ee()}#Ot(){const e=this.#i;if(!(this.#a.length===A||this.#U===0)){this.#Be();for(let t=0;t<A;t++){const i=e.createTexture();e.bindTexture(e.TEXTURE_2D,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,this.#U,this.#$,0,e.RGBA,e.UNSIGNED_BYTE,null);const s=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,s),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,i,0);const r=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;if(e.bindFramebuffer(e.FRAMEBUFFER,null),!r){e.deleteFramebuffer(s),e.deleteTexture(i),this.#Be();return}this.#a.push({texture:i,framebuffer:s})}this.#u=A-1}}#Be(){const e=this.#i,t=this.#l?.kind==="texture"?this.#l.texture:null;this.#a.some(i=>i.texture===t)&&(this.#l=null);for(const{texture:i,framebuffer:s}of this.#a)e.deleteFramebuffer(s),e.deleteTexture(i);this.#a=[],this.#x()}#fi(){if(this.#q)return;const e=this.#e.parentElement;if(!e)return;const t=document.createElement("div");t.style.cssText="position:relative;display:inline-block;line-height:0;max-width:100%",e.insertBefore(t,this.#e),t.appendChild(this.#e),t.appendChild(this.#n),this.#q=t,this.#te?.observe(this.#e),this.#Le()}#di(){if(this.#S)return;const e=this.#q;this.#q=null,this.#te?.disconnect(),this.#n.remove(),e?.parentElement&&(e.parentElement.insertBefore(this.#e,e),e.remove())}#Nt=()=>this.#Le();#bt(e){return!this.#p||this.#b==="main"?!1:(this.#p.postMessage({type:"event",name:e,video:this.#ot()}),!0)}#zt=()=>{if(this.#bt("emptied")){this.#Y(),this.#J(!1);return}this.#A=0,this.#Te=0,this.#Ke=0,this.#x(),this.#H(),this.#_=0,this.#Gt(),this.#l=null,this.#J(!1)};#Gt(){this.#P={filtered:0,missed:0,degraded:0,discontinuities:0,resynced:0,late:0,queueResetted:0},this.#Ge.fill(0),this.#tt=0,this.#Ae=0,this.#Ne=0,this.#Oe=0,this.#Q=0,this.#le=0,this.#ce=0,this.#ke=0,this.#ue=0,this.#z=0,this.#x(),this.#Se=0,this.#me=0,this.#Ce=0,this.#pe=0}#Xt=()=>{if(this.#bt("seeking")){this.#Y();return}this.#Fe=!1};#Z=e=>{if((e.type==="pause"||e.type==="ended"||e.type==="seeked"||e.type==="ratechange")&&this.#bt(e.type)){this.#Y();return}if(e.type==="seeked"){const i=this.#Fe;if(this.#Fe=!1,i)return;this.#A=0,this.#x(),this.#H(),this.#l=null,this.#J(!1);return}const t=e.type==="ratechange";if(t&&(this.#_=0,this.#Te=this.#e.currentTime),this.#x(),this.#k&&this.#A>0){const i=this.#Ct(),s=i===null?void 0:this.#a[i];i!==null&&s?(this.#u=i,this.#re(!0,!1,s.framebuffer),this.#Pt(i)):this.#re(!0,!1,null)}t&&(this.#A=0,this.#Ae=0,this.#H())};#$t=e=>{if(e.preventDefault(),this.#S){this.#S.onFailure("the deinterlacer WebGL context was lost");return}this.#b!=="active"&&(this.#G=!0,this.#nt("the deinterlacer WebGL context was lost"),this.stop())}}function Ge(n,e,t,i,s,r,h){return new ze(n,t,{canvas:e,onFailure:i,onVisibility:s,requestAnimationFrame:r,cancelAnimationFrame:h})}function J(n,e){const t=n.createProgram(),i=Z(n,n.VERTEX_SHADER,Ce),s=Z(n,n.FRAGMENT_SHADER,e);if(n.attachShader(t,i),n.attachShader(t,s),n.linkProgram(t),n.deleteShader(i),n.deleteShader(s),!n.getProgramParameter(t,n.LINK_STATUS)){const r=n.getProgramInfoLog(t);throw n.deleteProgram(t),new Error(`the deinterlacer failed to link: ${r??"no reason given"}`)}return t}function Z(n,e,t){const i=n.createShader(e);if(!i)throw new Error("the deinterlacer could not create a shader");if(n.shaderSource(i,t),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS)){const s=n.getShaderInfoLog(i);throw n.deleteShader(i),new Error(`the deinterlacer failed to compile: ${s??"no reason given"}`)}return i}const k=self;class Xe extends EventTarget{currentTime=0;playbackRate=1;seeking=!1;paused=!0;ended=!1;readyState=0;videoWidth=0;videoHeight=0;parentElement=null;offsetWidth=0;offsetHeight=0;offsetLeft=0;offsetTop=0;#t=[];update(e){this.currentTime=e.currentTime,this.playbackRate=e.playbackRate,this.seeking=e.seeking,this.paused=e.paused,this.ended=e.ended,this.readyState=e.readyState,this.videoWidth=e.videoWidth,this.videoHeight=e.videoHeight,this.#t=e.buffered}get buffered(){return{length:this.#t.length,start:e=>{const t=this.#t[e];if(!t)throw new DOMException("Invalid range index","IndexSizeError");return t.start},end:e=>{const t=this.#t[e];if(!t)throw new DOMException("Invalid range index","IndexSizeError");return t.end}}}getVideoPlaybackQuality(){return{creationTime:performance.now(),droppedVideoFrames:0,totalVideoFrames:0,corruptedVideoFrames:0}}requestVideoFrameCallback(){return 0}cancelVideoFrameCallback(){}}let g=null,E=null,ee=!1;function $e(n){return k.requestAnimationFrame(n)}function Ve(n){k.cancelAnimationFrame(n)}function T(n,e=[]){k.postMessage(n,e)}function He(n,e,t){n.doubleRate=e.doubleRate,n.spatialCheck=e.spatialCheck,(n.film!==e.film||t==="film")&&(n.film=e.film),n.debug=e.debug}k.onmessage=n=>{const e=n.data;try{if(e.type==="initialize"){if(typeof k.requestAnimationFrame!="function")throw new Error("requestAnimationFrame is unavailable in this Worker");g=new Xe,g.update(e.video),E=Ge(g,e.canvas,e.options,i=>{ee||T({type:"failed",message:i})},i=>T({type:"visibility",visible:i}),$e,Ve);let t=0;E.addEventListener("failure",()=>t++),E.addEventListener("stats",i=>{const{dropped:s,...r}=i.detail;T({type:"stats",stats:r,filmFailure:t})}),E.scan=e.scan,E.videoTimeline=e.videoTimeline,E.enabled=e.enabled,T({type:"ready"});return}if(!g||!E)return;switch(e.type){case"frame":g.update(e.video);try{E.ingestExternalFrame(performance.now(),e.metadata,e.frame,e.pixels)}finally{e.frame.close(),T({type:"consumed",id:e.id})}break;case"settings":He(E,e.options,e.retryFilm);break;case"scan":E.scan=e.scan;break;case"timeline":E.videoTimeline=e.videoTimeline;break;case"enabled":E.enabled=e.enabled;break;case"event":g.update(e.video),g.dispatchEvent(new Event(e.name));break;case"capture":g.videoWidth=e.width,g.videoHeight=e.height,E.capture().then(t=>T({type:"capture",id:e.id,image:t},[t])).catch(()=>T({type:"capture",id:e.id,image:null}));break;case"destroy":ee=!0,E.destroy(),E=null,g=null,k.close();break}}catch(t){const i=t instanceof Error?t.message:String(t);T({type:"failed",message:i})}}})();
//# sourceMappingURL=worker-BCUccpI4.js.map
