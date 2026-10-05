import { ParameterType } from "jspsych";
import { layoutParams } from "../params.js";

const info = {
  name: "navigate-blink-fixation",
  parameters: {
    row: { type: ParameterType.OBJECT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateBlinkFixationPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
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
    const phases = [
      { on: true, color: "rgb(255, 0, 0)", duration: params.blinkFixRedDurMs },
      { on: false, duration: params.blinkFixOffDurMs },
      { on: true, color: "rgb(255, 0, 0)", duration: params.blinkFixRedDurMs },
      { on: false, duration: params.blinkFixOffDurMs },
      { on: true, color: "rgb(0, 255, 0)", duration: params.blinkFixGreenDurMs }
    ];

    let held = false;
    let onset = null;
    let phaseIndex = 0;
    let timer = null;
    let resets = 0;

    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const draw = (phase, message = "") => {
      ctx.fillStyle = params.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (phase?.on) {
        ctx.fillStyle = phase.color;
        ctx.font = `${layout.fixSizePx}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("+", xCenter, fixY);
      }

      if (message) {
        ctx.fillStyle = params.fgColor;
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(message, xCenter, yCenter + Math.max(90, layout.fixSizePx));
      }
    };

    const finish = () => {
      const offset = performance.now();
      cleanup();
      displayElement.innerHTML = "";
      this.jsPsych.finishTrial({
        phase: "blink_fixation",
        trial: trial.row.trial,
        run: trial.row.run,
        block: trial.row.block,
        blink_fix_onset: onset,
        blink_fix_offset: offset,
        blink_fix_da: onset === null ? null : (offset - onset) / 1000,
        blink_fix_resets: resets
      });
    };

    const runPhase = () => {
      if (!held) return;
      if (phaseIndex >= phases.length) {
        finish();
        return;
      }

      const phase = phases[phaseIndex];
      if (onset === null) onset = performance.now();
      draw(phase);
      timer = setTimeout(() => {
        phaseIndex += 1;
        runPhase();
      }, phase.duration);
    };

    const reset = () => {
      clearTimer();
      held = false;
      onset = null;
      phaseIndex = 0;
      resets += 1;
      draw(null, "Press START");
    };

    const onKeyDown = (event) => {
      if (event.code !== "Space" || held) return;
      event.preventDefault();
      held = true;
      phaseIndex = 0;
      onset = null;
      runPhase();
    };

    const onKeyUp = (event) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      if (phaseIndex < phases.length) reset();
    };

    const cleanup = () => {
      clearTimer();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };

    draw(null, "Hold space for fixation");
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  }
}
