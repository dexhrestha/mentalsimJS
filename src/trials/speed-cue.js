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
    const movementDurMs = (nImages / speed) * params.speedCueLoops * 1000;
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

    const drawFrame = (currPos) => {
      ctx.fillStyle = params.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      const elapsed = time - onset;
      if (elapsed >= movementDurMs || traveledSlots >= nImages) {
        finish(time);
        return;
      }

      let dt = (time - prevTime) / 1000;
      prevTime = time;
      if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25) dt = 1 / 60;

      const deltaPx = speedPxPerSec * dt * direction;
      offsetPx += deltaPx;
      traveledSlots += Math.abs(deltaPx) / spacingPx;

      const stepCount = matlabFix(offsetPx / spacingPx);
      if (stepCount !== 0) {
        offsetPx -= stepCount * spacingPx;
        imgArrShifted = circshift(imgArrShifted, stepCount);
      }

      drawFrame(basePos.map((pos) => pos + offsetPx));
      frameTimes.push(time);
      rafId = requestAnimationFrame(frame);
    };

    ctx.fillStyle = params.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMultilineText(ctx, text, xCenter, yCenter - layout.speedCueOffsetPx, params.fgColor, layout.speedTextPx);
    rafId = requestAnimationFrame(frame);
  }
}
