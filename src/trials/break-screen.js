import { ParameterType } from "jspsych";

const info = {
  name: "navigate-break-screen",
  parameters: {
    run: { type: ParameterType.INT, default: undefined },
    params: { type: ParameterType.OBJECT, default: undefined }
  }
};

export class NavigateBreakScreenPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(displayElement, trial) {
    const breakDurMs = Number(trial.params.breakDurMs ?? 60000);
    const message = trial.params.lang === 1
      ? "Fai una pausa di un minuto per riposare gli occhi."
      : "Please take one minute break to rest your eyes.";
    const onset = performance.now();
    let canContinue = false;

    displayElement.innerHTML = `
      <main class="start-screen">
        <h1>Break</h1>
        <p id="break-message">${message}</p>
      </main>
    `;

    const finish = () => {
      const offset = performance.now();
      document.removeEventListener("keydown", onKeyDown);
      displayElement.innerHTML = "";
      this.jsPsych.finishTrial({
        phase: "break",
        completed_run: trial.run,
        break_onset: onset,
        break_offset: offset,
        break_da: (offset - onset) / 1000
      });
    };

    const onKeyDown = (event) => {
      if (!canContinue || event.code !== "Space") return;
      event.preventDefault();
      finish();
    };

    document.addEventListener("keydown", onKeyDown);

    setTimeout(() => {
      canContinue = true;
      const messageElement = displayElement.querySelector("#break-message");
      if (messageElement) {
        messageElement.style.color = "rgb(0, 255, 0)";
        messageElement.textContent = `${message} Press space to continue.`;
      }
    }, breakDurMs);
  }
}
