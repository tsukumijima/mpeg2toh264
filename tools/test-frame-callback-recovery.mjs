/**
 * A frame callback that stops coming must not change how often pictures are
 * taken in.
 *
 * `requestVideoFrameCallback` is re-armed from inside its own callback, so a
 * callback that never returns normally -- or a registration the browser drops
 * -- leaves the element with none, and only the watchdog's animation-frame
 * fallback keeps the filter fed. In a browser `currentTime` moves on at every
 * animation frame, not once per decoded picture, so treating any change of it
 * as a new picture takes the same picture in twice. The two captures of one
 * picture measure half a frame period, the shorter period lowers the fallback's
 * spacing to one refresh, and from then on every refresh is taken as a frame:
 * 60 a second, which film reconstruction turns into 48 instead of 24. Nothing
 * clears it short of reloading the player.
 *
 * These cases drive the real `deinterlace.ts` through
 * `tools/yadif-clock-harness.mjs` and count the fields the filter produced
 * after the callback stops, with the decoded-frame counter advancing at the
 * source's 30 frames a second.
 */
import assert from "node:assert/strict";

import { buildBundles, REFRESH_MS, run } from "./yadif-clock-harness.mjs";

const VSYNCS = 600;
/** The refresh from which the element stops serving frame callbacks. */
const STOP = 120;
/** Leave the watchdog and the period estimate time to settle before counting. */
const COUNT_FROM = STOP + 120;

/**
 * Stop frame callbacks at `STOP`, then keep the element playing the way a
 * browser does: the clock moves every refresh, the decoded count every other.
 */
function stopFrameCallbacks(vsync, control) {
  if (vsync < STOP) return;
  if (vsync === STOP) control.frames(false);
  control.video.currentTime = (vsync * REFRESH_MS) / 1000;
  control.video.pictureTime = (Math.floor(vsync / 2) * 2 * REFRESH_MS) / 1000;
  control.video.totalVideoFrames = Math.floor(vsync / 2) + 1;
}

/** Fields filtered into the output pool from `COUNT_FROM` on, per source frame. */
function fieldsPerFrame(result) {
  const from = 2_000_000 + COUNT_FROM * REFRESH_MS;
  const filtered = result.draws.filter(
    (draw) => !draw.toCanvas && draw.t >= from,
  ).length;
  const frames = (VSYNCS - COUNT_FROM) / 2;
  return filtered / frames;
}

const bundles = await buildBundles(process.cwd());

const result = await run(bundles, {
  vsyncs: VSYNCS,
  rendering: "main",
  beforeVsync: stopFrameCallbacks,
});
const perFrame = fieldsPerFrame(result);
// Double rate filters two fields from each picture it takes in. Taking each
// picture once gives two per source frame; taking it twice gives four.
assert.ok(
  perFrame > 1.8 && perFrame < 2.2,
  `the fallback filtered ${perFrame.toFixed(2)} fields per source frame after the frame callback stopped; each picture should be taken in once`,
);
assert.equal(result.failures.length, 0, result.failures[0]?.message);
console.log(
  `ok - the fallback takes each picture in once (${perFrame.toFixed(2)} fields per frame)`,
);

// Offset counter updates from picture changes to catch repeated ingestion
// of the same picture.
for (const rendering of ["main", "worker"]) {
  const skewed = await run(bundles, {
    vsyncs: VSYNCS,
    rendering,
    beforeVsync(vsync, control) {
      stopFrameCallbacks(vsync, control);
      if (vsync >= STOP) {
        const early = Math.floor(vsync / 8) % 2;
        control.video.totalVideoFrames = Math.floor((vsync + early) / 2) + 1;
      }
    },
  });
  const from = 2_000_000 + COUNT_FROM * REFRESH_MS;
  const fields = new Map();
  for (const draw of skewed.draws) {
    if (draw.toCanvas || draw.t < from) continue;
    const time = draw.picture?.mediaTime;
    fields.set(time, (fields.get(time) ?? 0) + 1);
  }
  assert.ok(fields.size > (VSYNCS - COUNT_FROM) / 2 - 3);
  assert.equal(
    Math.max(...fields.values()),
    2,
    `${rendering}: the same source picture was filtered more than once`,
  );
  assert.equal(skewed.failures.length, 0, skewed.failures[0]?.message);
  skewed.control.deinterlacer("__deinterlacer.destroy()");
  assert.equal(
    skewed.pageContext.VideoFrame.created,
    skewed.pageContext.VideoFrame.closed,
    `${rendering}: captured frames remained open after destruction`,
  );
  console.log(
    `ok - ${rendering} fallback follows picture timestamps despite counter skew`,
  );
}

// Stop during pixel readback and resume at another position. Only pictures
// from the resumed playback should be displayed.
for (const rendering of ["main", "worker"]) {
  const delayed = await run(bundles, {
    vsyncs: 360,
    rendering,
    pixelCopyDelayMs: 300,
    beforeVsync(vsync, control) {
      stopFrameCallbacks(vsync, control);
      if (vsync === 140) control.deinterlacer("__deinterlacer.stop()");
      if (vsync >= 200) {
        control.video.currentTime += 100;
        control.video.pictureTime += 100;
      }
      if (vsync === 200) control.deinterlacer("__deinterlacer.start()");
      if (vsync === 320) control.deinterlacer("__deinterlacer.destroy()");
    },
  });
  const resumed = delayed.draws.filter(
    (draw) => !draw.blit && draw.t > 2_000_000 + 200 * REFRESH_MS,
  );
  assert.ok(
    resumed.length > 0,
    `${rendering}: no pictures arrived after restart`,
  );
  assert.ok(
    resumed.every((draw) => draw.picture?.mediaTime >= 100),
    `${rendering}: an old pixel readback reached the new playback`,
  );
  assert.equal(
    delayed.pageContext.VideoFrame.created,
    delayed.pageContext.VideoFrame.closed,
  );
  console.log(
    `ok - ${rendering} discards pixel readback from a stopped playback`,
  );
}

// When only the registration is lost, re-registered callbacks continue to
// assist frame acquisition.
let delivered = 0;
let current = 0;
await run(bundles, {
  vsyncs: VSYNCS,
  rendering: "main",
  beforeVsync(vsync, control) {
    current = vsync;
    const video = control.video;
    if (vsync === 0) {
      const deliver = video.deliverFrame.bind(video);
      video.deliverFrame = (now, metadata) => {
        const served = deliver(now, metadata);
        if (served && current >= COUNT_FROM) delivered++;
        return served;
      };
    }
    if (vsync === STOP) video.cancelVideoFrameCallback();
  },
});
const expected = (VSYNCS - COUNT_FROM) / 2;
assert.ok(
  delivered > expected * 0.9,
  `only ${delivered} of ${expected} frames came through the frame callback after its registration was dropped`,
);
console.log(
  `ok - a dropped frame callback is asked for again (${delivered} of ${expected} frames delivered)`,
);
