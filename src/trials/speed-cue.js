import { ParameterType } from "jspsych";
import { layoutParams } from "../params.js";
import { drawStimulusImage } from "../stimuli.js";

function matlabFix(value) {
  return value < 0 ? Math.ceil(value) : Math.floor(value);
}

function circshift(values, shift) {
  const n = values.length;
  return values.map((_, index) => values[((index - shift) % n + n) % n]);
}

function speedCueText(row, params) {
  const speed = Number(row.speed);
  const visual = Boolean(Number(row.visual));

  if (params.lang === 1) {
    return `${speed === 2 ? "VELOCE" : "LENTO"}\n${visual ? "GIORNO" : "NOTTE"}`;
  }

  return `${speed === 2 ? "FAST" : "SLOW"}\n${visual ? "LIGHT" : "DARK"}`;
}

function drawMultilineText(ctx, text, x, y, color, sizePx) {
  const lines = text.split("\n");
  const lineHeight = sizePx * 1.15;
  const firstY = y - ((lines.length - 1) * lineHeight) / 2;

  ctx.fillStyle = color;
  ctx.font = `${sizePx}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, index) => {
    ctx.fillText(line, x, firstY + index * lineHeight);
  });
}

// Hyperspace starfield, same values as setup_stars.m
const starfield = {
  nStars: 1600,
  spaceSize: 20,
  zMax: 20,
  zMin: 0.15,
  focalLength: 650,
  streakLength: 1.5,
  fadeWidthPx: 8,
  startXSpread: 20
};

function createStarfield(lmHeightPx) {
  const { nStars, spaceSize, zMax, zMin } = starfield;
  return {
    x: Array.from({ length: nStars }, () => (Math.random() - 0.5) * spaceSize),
    y: Array.from({ length: nStars }, () => (Math.random() - 0.5) * spaceSize),
    z: Array.from({ length: nStars }, () => Math.random() * zMax + zMin),
    baseBrightness: Array.from({ length: nStars }, () => 60 + 95 * Math.random()),
    centerDeadZonePx: lmHeightPx / 2
  };
}

function drawStarfield(ctx, star, step, xCenter, yCenter, width, height) {
  const { zMax, zMin, spaceSize, startXSpread, focalLength, streakLength, fadeWidthPx } = starfield;
  const lowerHalfY = height * 0.5;

  for (let i = 0; i < star.z.length; i += 1) {
    let zOld = star.z[i] + step * streakLength;
    star.z[i] -= step;

    if (star.z[i] <= zMin) {
      star.x[i] = (Math.random() - 0.5) * startXSpread;
      star.y[i] = (Math.random() - 0.5) * spaceSize;
      star.z[i] = zMax;
      zOld = zMax + step * streakLength;
      star.baseBrightness[i] = 60 + 95 * Math.random();
    }

    const z = star.z[i];
    const sx = xCenter + focalLength * (star.x[i] / z);
    const sy = yCenter + focalLength * (star.y[i] / z);
    const sxOld = xCenter + focalLength * (star.x[i] / zOld);
    const syOld = yCenter + focalLength * (star.y[i] / zOld);
    const r = Math.hypot(sx - xCenter, sy - yCenter);

    if (sx < 0 || sx > width || sy < lowerHalfY || sy > height || r <= star.centerDeadZonePx) continue;

    const fade = Math.min(Math.max((r - star.centerDeadZonePx) / fadeWidthPx, 0), 1);
    const size = Math.min(Math.max(1 + 5 / z, 1), 6);
    const brightness = Math.round(Math.min(Math.max(star.baseBrightness[i] * fade, 0), 255));

    ctx.strokeStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.lineWidth = Math.round(size);
    ctx.beginPath();
    ctx.moveTo(sxOld, syOld);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
}

const info = {
  name: "navigate-speed-cue",
  parameters: {
    row: { type: ParameterType.OBJECT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateSpeedCuePlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
    const row = trial.row;
    const params = trial.params;
    const layout = layoutParams(params);
    const canvas = document.createElement("canvas");
    canvas.width = params.screenWidthPx;
    canvas.height = params.screenHeightPx;
    canvas.className = "experiment-canvas";
    displayElement.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const xCenter = canvas.width / 2;
    const yCenter = canvas.height / 2;
    const yPos = yCenter - layout.startYPx;
    const spacingPx = layout.lmWidthPx + layout.ildPx;
    const direction = Math.sign(params.participant.direction || 1);
    const speed = Number(row.speed);
    const speedPxPerSec = speed * spacingPx;
    const imgArr = Array.from({ length: params.categories.length * params.nCatImages }, (_, i) => i + 1);
    const nImages = imgArr.length;
    const startId = Math.ceil(nImages / 2) + 1;
    const centerIdx = 0;
    const currIdx = imgArr.indexOf(startId);
    const shiftAmount = centerIdx - currIdx;
    const basePos = imgArr.map((_, index) => (index - centerIdx) * spacingPx);
    const text = speedCueText(row, params);
    const starSpeed = (speedPxPerSec / starfield.focalLength) * 0.25;
    const stars = createStarfield(layout.lmHeightPx);
    const expectedFrameMs = 1000 / 60;

    let imgArrShifted = circshift(imgArr, shiftAmount);
    let offsetPx = 0;
    let traveledSlots = 0;
    let onset = null;
    let prevTime = null;
    let rafId = null;
    const frameTimes = [];

    const drawFixation = () => {
      ctx.fillStyle = params.fixColor;
      ctx.font = `${layout.fixSizePx}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", xCenter, yPos);
    };

    const drawFrame = (currPos, starStep) => {
      ctx.fillStyle = params.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawStarfield(ctx, stars, starStep, xCenter, yPos, canvas.width, canvas.height);

      currPos.forEach((pos, index) => {
        const alpha01 = (1 - Math.min(Math.abs(pos) / spacingPx, 1)) ** 6;
        if (alpha01 <= 0) return;
        const xDraw = params.central ? xCenter : xCenter + pos;
        drawStimulusImage(ctx, xDraw, yPos, layout.lmWidthPx, layout.lmHeightPx, imgArrShifted[index], alpha01, params);
      });

      drawFixation();
      drawMultilineText(ctx, text, xCenter, yCenter - layout.speedCueOffsetPx, params.fgColor, layout.speedTextPx);
    };

    const finish = (offset) => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      displayElement.innerHTML = "";

      const intervals = frameTimes.slice(1).map((time, index) => (time - frameTimes[index]) / 1000).filter((interval) => Number.isFinite(interval) && interval > 0);
      const meanInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
      const maxInterval = intervals.length ? Math.max(...intervals) : NaN;

      this.jsPsych.finishTrial({
        phase: "speed_cue",
        trial: row.trial,
        run: row.run,
        block: row.block,
        speed_cue_onset: onset,
        speed_cue_offset: offset,
        speed_cue_da: (offset - onset) / 1000,
        speedCueExpectedFps: 1000 / expectedFrameMs,
        speedCueFps: intervals.length ? 1 / meanInterval : NaN,
        speedCueMinFps: intervals.length ? 1 / maxInterval : NaN,
        speedCueMaxFrameMs: intervals.length ? maxInterval * 1000 : NaN,
        speedCueMissedFrames: intervals.reduce((sum, interval) => sum + Math.max(0, Math.round(interval / (expectedFrameMs / 1000)) - 1), 0)
      });
    };

    const frame = (time) => {
      if (onset === null) {
        onset = time;
        prevTime = time;
      }

      let dt = (time - prevTime) / 1000;
      prevTime = time;
      if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25) dt = 1 / 60;

      const starStep = starSpeed * dt * 60;
      const deltaPx = speedPxPerSec * dt * direction;
      offsetPx += deltaPx;
      traveledSlots += Math.abs(deltaPx) / spacingPx;

      const stepCount = matlabFix(offsetPx / spacingPx);
      if (stepCount !== 0) {
        offsetPx -= stepCount * spacingPx;
        imgArrShifted = circshift(imgArrShifted, stepCount);
      }

      if (traveledSlots >= nImages) {
        finish(frameTimes.length ? frameTimes[frameTimes.length - 1] : time);
        return;
      }

      drawFrame(basePos.map((pos) => pos + offsetPx), starStep);
      frameTimes.push(time);
      rafId = requestAnimationFrame(frame);
    };

    ctx.fillStyle = params.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMultilineText(ctx, text, xCenter, yCenter - layout.speedCueOffsetPx, params.fgColor, layout.speedTextPx);
    rafId = requestAnimationFrame(frame);
  }
}
