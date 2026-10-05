import { ParameterType } from "jspsych";
import { layoutParams } from "../params.js";
import { drawStimulusImage } from "../stimuli.js";

function rect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
}

function strokeRect(ctx, x, y, width, height, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x - width / 2, y - height / 2, width, height);
}

function drawCenteredText(ctx, text, x, y, color, sizePx) {
  ctx.fillStyle = color;
  ctx.font = `${sizePx}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawCross(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x - size, y + size);
  ctx.lineTo(x + size, y - size);
  ctx.stroke();
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
  name: "navigate-feedback",
  parameters: {
    row: { type: ParameterType.OBJECT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateFeedbackPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
    const row = trial.row;
    const params = trial.params;
    const layout = layoutParams(params);
    const movement = this.jsPsych.data.get().last(1).values()[0] ?? {};
    const canvas = document.createElement("canvas");
    canvas.width = params.screenWidthPx;
    canvas.height = params.screenHeightPx;
    canvas.className = "experiment-canvas";
    displayElement.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - layout.startYPx;
    const targetY = canvas.height / 2 + layout.targetYPx;
    const currPos = movement.finalCurrPos ?? [];
    const imgArrShifted = movement.finalImgArrShifted ?? [];
    const alphaVec = movement.finalAlpha ?? currPos.map((pos) => Math.round(255 * (1 - Math.min(Math.abs(pos) / (layout.lmWidthPx + layout.ildPx), 1)) ** 6));
    const visibleVec = movement.finalVisible ?? alphaVec.map((alpha) => alpha > 0);
    const spacingPx = layout.lmWidthPx + layout.ildPx;
    const direction = Math.sign(params.participant.direction || 1);
    const currentIdx = selectCurrentIndex(currPos, direction);
    const currentImgId = imgArrShifted[currentIdx];
    const targetIdx = imgArrShifted.indexOf(Number(row.target_id));
    const targetPosPx = targetIdx >= 0 ? currPos[targetIdx] : NaN;
    const targetDistancePx = targetIdx >= 0 ? targetPosPx - currPos[currentIdx] : NaN;
    const targetDistanceLm = targetDistancePx / spacingPx;
    const signedLm = targetDistanceLm * direction;
    const absLm = Math.round(Math.abs(targetDistanceLm) * 100) / 100;
    const landingPx = targetDistancePx;
    const tp = Number(movement.tp);

    ctx.fillStyle = params.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    currPos.forEach((pos, index) => {
      const alpha = Math.max(0, Math.min(255, Number(alphaVec[index] ?? 0)));
      if (!visibleVec[index] || alpha <= 0) return;
      const xPos = params.central ? centerX : centerX + pos;
      drawStimulusImage(ctx, xPos, centerY, layout.lmWidthPx, layout.lmHeightPx, imgArrShifted[index], alpha / 255, params);
    });

    drawStimulusImage(
      ctx,
      centerX,
      targetY,
      layout.lmWidthPx,
      layout.lmHeightPx,
      (Number(row.target_cat) - 1) * params.nCatImages + Number(row.target_cat_pos),
      1,
      params
    );

    const centerBarY = centerY - Math.round(1.1 * layout.lmHeightPx);
    const centerBarH = Math.max(8, Math.round(0.08 * layout.lmHeightPx));
    const green = "rgb(0, 220, 0)";
    const yellow = "rgb(235, 210, 0)";
    const red = "rgb(220, 0, 0)";
    const white = "rgb(255, 255, 255)";

    if (tp > 0 && Number.isFinite(absLm)) {
      if (absLm <= 0.5) {
        const barW = Math.round(layout.lmWidthPx);
        const barHalfW = barW / 4;
        rect(ctx, centerX, centerBarY, barW, centerBarH, "rgb(80, 80, 80)");
        strokeRect(ctx, centerX, centerBarY, barW, centerBarH, white, 2);

        const clippedLanding = Math.max(-barHalfW, Math.min(barHalfW, Math.round(-landingPx)));
        const seekX = centerX + clippedLanding;
        const seekHalfW = Math.max(3, Math.round(0.035 * spacingPx));
        rect(ctx, seekX, centerBarY, seekHalfW * 2, centerBarH, green);
      } else if (absLm <= 1) {
        drawCenteredText(ctx, signedLm >= 0 ? "+1" : "-1", centerX, centerBarY - Math.round(0.8 * layout.lmHeightPx), yellow, Math.round(layout.fixSizePx * 0.9));
      } else if (absLm <= 2) {
        drawCenteredText(ctx, signedLm >= 0 ? "+2" : "-2", centerX, centerBarY - Math.round(0.8 * layout.lmHeightPx), red, Math.round(layout.fixSizePx * 0.9));
      } else {
        drawCross(ctx, centerX, centerY, Math.round(0.5 * layout.lmHeightPx), red);
      }
    } else {
      drawCross(ctx, centerX, centerY, Math.round(0.5 * layout.lmHeightPx), red);
    }

    const onset = performance.now();
    setTimeout(() => {
      const offset = performance.now();
      displayElement.innerHTML = "";
      this.jsPsych.finishTrial({
        phase: "feedback",
        trial: row.trial,
        run: row.run,
        block: row.block,
        feedback_onset: onset,
        feedback_offset: offset,
        feedback_da: (offset - onset) / 1000,
        feedbackCurrentIdx: currentIdx,
        feedbackCurrentImgId: currentImgId,
        feedbackCurrentPosPx: currPos[currentIdx],
        feedbackTargetIdx: targetIdx,
        feedbackTargetPosPx: targetPosPx,
        feedbackTargetDistancePx: targetDistancePx,
        feedbackTargetDistanceLm: targetDistanceLm,
        feedbackTargetDistanceSlots: targetDistanceLm,
        feedbackAbsLm: absLm,
        abslm: absLm,
        feedbackCenterIdx: currentIdx,
        feedbackCenterImgId: currentImgId,
        feedbackCenterPosPx: currPos[currentIdx],
        feedbackDirection: direction,
        feedbackLandingPx: landingPx,
        feedbackSignedLm: signedLm
      });
    }, Number(row.feedback_dur));
  }
}
