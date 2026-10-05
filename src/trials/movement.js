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

function wrapIndex(index, shift, n) {
  return ((index + shift) % n + n) % n;
}

function buildSampleState(row, params, layout) {
  const imgArr = Array.from({ length: params.categories.length * params.nCatImages }, (_, i) => i + 1);
  const centerIdx = Math.ceil(imgArr.length / 2);
  const currIdx = imgArr.indexOf(Number(row.start_id));
  const shiftAmount = centerIdx - currIdx;
  const imgArrShifted = circshift(imgArr, shiftAmount);
  const startCenterIdx = imgArrShifted.indexOf(Number(row.start_id));
  const spacingPx = layout.lmWidthPx + layout.ildPx;
  const imgArrPos = imgArrShifted.map((_, index) => (index - startCenterIdx) * spacingPx);

  return { imgArrShifted, imgArrPos, spacingPx };
}

function selectCurrentIndex(currPos, direction) {
  const finiteIndices = currPos.map((value, index) => (Number.isFinite(value) ? index : -1)).filter((index) => index >= 0);
  const eligible = finiteIndices.filter((index) => (direction === 1 ? currPos[index] <= 0 : currPos[index] >= 0));

  if (eligible.length > 0) {
    return eligible.reduce((best, index) => {
      if (direction === 1) return currPos[index] > currPos[best] ? index : best;
      return currPos[index] < currPos[best] ? index : best;
    }, eligible[0]);
  }

  return finiteIndices.reduce((best, index) => {
    return Math.abs(currPos[index]) < Math.abs(currPos[best]) ? index : best;
  }, finiteIndices[0] ?? 0);
}

const info = {
  name: "navigate-movement",
  parameters: {
    row: { type: ParameterType.OBJECT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateMovementPlugin {
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
    const fixY = yCenter - layout.startYPx;
    const { imgArrPos, spacingPx, imgArrShifted: initialImgArrShifted } = buildSampleState(row, params, layout);
    const basePos = [...imgArrPos];
    const nImgs = basePos.length;
    const startId = Number(row.start_id);
    const targetId = Number(row.target_id);
    const speedPxPerSec = Number(row.speed) * spacingPx;
    const movementDurMs = Number(row.ts) + Number(row.buffer_dur);
    const visual = Boolean(Number(row.visual));
    const direction = Math.sign(params.participant.direction || 1);

    let imgArrShifted = [...initialImgArrShifted];
    let idxStart = imgArrShifted.indexOf(startId);
    let idxTarget = imgArrShifted.indexOf(targetId);
    let offsetPx = 0;
    let totalSteps = 0;
    let showSeq = true;
    let initFlag = true;
    let tp = -1;
    let released = false;
    let spaceWasPressed = false;
    let rafId = null;
    let onset = null;
    let prevTime = null;
    let finalOffsetPx = 0;
    let finalCurrPos = [...basePos];
    let finalImgArrShifted = [...imgArrShifted];
    let finalAlpha = Array(nImgs).fill(0);
    let finalVisible = Array(nImgs).fill(false);
    let finalShowSeq = showSeq;
    let finalInitFlag = initFlag;
    let finalFrameTime = null;

    const drawFixation = () => {
      ctx.fillStyle = params.fixColor;
      ctx.font = `${layout.fixSizePx}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", xCenter, fixY);
    };

    const drawFrame = (currPos, drawAllowed) => {
      const frameAlpha = Array(nImgs).fill(0);
      const frameVisible = Array(nImgs).fill(false);

      ctx.fillStyle = params.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (drawAllowed) {
        currPos.forEach((pos, index) => {
          const alpha01 = (1 - Math.min(Math.abs(pos) / spacingPx, 1)) ** 6;
          let visible = alpha01 > 0;

          if (initFlag) {
            visible = visible && (direction === 1 ? pos <= spacingPx : pos >= -spacingPx);
          }

          if (!visible) return;

          frameAlpha[index] = Math.round(alpha01 * 255);
          frameVisible[index] = true;
          const xDraw = params.central ? xCenter : xCenter + pos;
          drawStimulusImage(ctx, xDraw, fixY, layout.lmWidthPx, layout.lmHeightPx, imgArrShifted[index], alpha01, params);
        });
      }

      drawFixation();
      return { frameAlpha, frameVisible };
    };

    const finish = (offset) => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      cleanup();

      const idxTargetFinal = finalImgArrShifted.indexOf(targetId);
      const finalTargetPosPx = idxTargetFinal >= 0 ? finalCurrPos[idxTargetFinal] : NaN;
      const finalCurrentIdx = selectCurrentIndex(finalCurrPos, direction);
      const finalCurrentImgId = finalImgArrShifted[finalCurrentIdx];
      const finalCurrentPosPx = finalCurrPos[finalCurrentIdx];
      const finalTargetDistancePx = finalTargetPosPx - finalCurrentPosPx;
      const finalTargetDistanceSlots = finalTargetDistancePx / spacingPx;

      displayElement.innerHTML = "";
      this.jsPsych.finishTrial({
        phase: "movement",
        trial: row.trial,
        run: row.run,
        block: row.block,
        movement_onset: onset,
        movement_offset: offset,
        movement_da: (offset - onset) / 1000,
        target_pos: finalTargetPosPx,
        tp,
        movementTotalSteps: totalSteps,
        movementFinalOffsetPx: finalOffsetPx,
        finalOffsetPx,
        finalImgArrShifted,
        finalTargetPosPx,
        finalCurrPos,
        finalAlpha,
        finalVisible,
        finalShowSeq,
        finalInitFlag,
        finalFrameTime,
        finalCurrentIdx,
        finalCurrentImgId,
        finalCurrentPosPx,
        finalTargetDistancePx,
        finalTargetDistanceSlots
      });
    };

    const frame = (time) => {
      if (onset === null) {
        onset = time;
        prevTime = time;
        spaceWasPressed = pressedKeys.has("Space");
      }

      if (time - onset >= movementDurMs || released) {
        finish(time);
        return;
      }

      let dt = (time - prevTime) / 1000;
      prevTime = time;
      if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25) dt = 1 / 60;

      offsetPx += speedPxPerSec * dt * direction;
      const stepCount = matlabFix(offsetPx / spacingPx);

      if (stepCount !== 0) {
        offsetPx -= stepCount * spacingPx;
        totalSteps += stepCount;
        imgArrShifted = circshift(imgArrShifted, stepCount);
        idxStart = wrapIndex(idxStart, stepCount, nImgs);
        idxTarget = wrapIndex(idxTarget, stepCount, nImgs);
      }

      const currPos = basePos.map((pos) => pos + offsetPx);
      const posOfImageX = idxStart >= 0 ? Math.abs(currPos[idxStart]) : Infinity;
      showSeq = showSeq && posOfImageX < spacingPx * 2;
      initFlag = initFlag && posOfImageX < spacingPx;

      const drawAllowed = showSeq || visual;
      const { frameAlpha, frameVisible } = drawFrame(currPos, drawAllowed);

      finalOffsetPx = offsetPx;
      finalCurrPos = currPos;
      finalImgArrShifted = [...imgArrShifted];
      finalAlpha = frameAlpha;
      finalVisible = frameVisible;
      finalShowSeq = showSeq;
      finalInitFlag = initFlag;
      finalFrameTime = time;

      rafId = requestAnimationFrame(frame);
    };

    const pressedKeys = new Set();

    const onKeyDown = (event) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      pressedKeys.add("Space");
      spaceWasPressed = true;
    };

    const onKeyUp = (event) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      pressedKeys.delete("Space");
      if (spaceWasPressed && onset !== null && !released) {
        released = true;
        tp = (performance.now() - onset) / 1000;
      }
    };

    const cleanup = () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    rafId = requestAnimationFrame(frame);
  }
}
