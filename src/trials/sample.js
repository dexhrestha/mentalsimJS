import { ParameterType } from "jspsych";
import { layoutParams } from "../params.js";
import { drawStimulusImage } from "../stimuli.js";

function circshift(values, shift) {
  const n = values.length;
  return values.map((_, index) => values[((index - shift) % n + n) % n]);
}

function centerRect(width, height, x, y) {
  return { x: x - width / 2, y: y - height / 2, width, height };
}

const info = {
  name: "navigate-sample",
  parameters: {
    row: { type: ParameterType.OBJECT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateSamplePlugin {
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
      const sampleDurMs = Number(row.sample_dur);
      const imgArr = Array.from({ length: params.categories.length * params.nCatImages }, (_, i) => i + 1);
      const centerIdx = Math.ceil(imgArr.length / 2);
      const currIdx = imgArr.indexOf(Number(row.start_id));
      const shiftAmount = centerIdx - currIdx;
      const imgArrShifted = circshift(imgArr, shiftAmount);
      const startCenterIdx = imgArrShifted.indexOf(Number(row.start_id));
      const spacingPx = layout.lmWidthPx + layout.ildPx;
      const imgArrPos = imgArrShifted.map((_, index) => (index - startCenterIdx) * spacingPx);
      const yPos = yCenter - layout.startYPx;
      const targetY = yCenter + layout.targetYPx;
      const direction = Math.sign(params.participant.direction || 1);

      ctx.fillStyle = params.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      imgArrShifted.forEach((imageId, index) => {
        const pos = imgArrPos[index];
        const allowed = direction === 1 ? pos <= 0 : pos >= 0;
        if (!allowed) return;
        const xPos = params.central ? xCenter : xCenter + pos;
        const alpha01 = (1 - Math.min(Math.abs(pos) / spacingPx, 1)) ** 8;
        if (alpha01 <= 0) return;
        drawStimulusImage(ctx, xPos, yPos, layout.lmWidthPx, layout.lmHeightPx, imageId, alpha01, params);
      });

      drawStimulusImage(
        ctx,
        xCenter,
        targetY,
        layout.lmWidthPx,
        layout.lmHeightPx,
        (Number(row.target_cat) - 1) * params.nCatImages + Number(row.target_cat_pos),
        1,
        params
      );

      ctx.fillStyle = params.fixColor;
      ctx.font = `${layout.fixSizePx}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", xCenter, yPos);

      const targetRect = centerRect(layout.lmWidthPx, layout.lmHeightPx, xCenter, targetY);
      const onset = performance.now();
      let startPressed = false;
      let ended = false;
      let timer = null;

      const finish = () => {
        if (ended) return;
        ended = true;
        if (timer !== null) clearTimeout(timer);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);

        const offset = performance.now();
        displayElement.innerHTML = "";
        this.jsPsych.finishTrial({
          phase: "sample",
          trial: row.trial,
          run: row.run,
          block: row.block,
          is_probe: row.is_probe,
          sample_onset: onset,
          sample_offset: offset,
          sample_da: (offset - onset) / 1000,
          imgArrShifted,
          imgArrPos,
          targetRect
        });
      };

      const onKeyDown = (event) => {
        if (event.code !== "Space") return;
        event.preventDefault();
        if (!startPressed) startPressed = true;
      };

      const onKeyUp = (event) => {
        if (event.code !== "Space") return;
        event.preventDefault();
        if (startPressed) finish();
      };

      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
      timer = setTimeout(finish, sampleDurMs);
    }
}
