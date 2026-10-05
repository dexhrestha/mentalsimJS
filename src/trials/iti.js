import { ParameterType } from "jspsych";

const info = {
  name: "navigate-iti",
  parameters: {
    row: { type: ParameterType.OBJECT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateItiPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

    trial(displayElement, trial) {
      const canvas = document.createElement("canvas");
      canvas.width = trial.params.screenWidthPx;
      canvas.height = trial.params.screenHeightPx;
      canvas.className = "experiment-canvas";
      displayElement.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = trial.params.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const onset = performance.now();
      setTimeout(() => {
        const offset = performance.now();
        displayElement.innerHTML = "";
        this.jsPsych.finishTrial({
          phase: "iti",
          trial: trial.row.trial,
          run: trial.row.run,
          block: trial.row.block,
          iti_onset: onset,
          iti_offset: offset,
          iti_da: (offset - onset) / 1000
        });
      }, Number(trial.row.iti_dur));
    }
}
