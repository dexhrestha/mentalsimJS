import { ParameterType } from "jspsych";

const info = {
  name: "navigate-consent",
  version: "1.1.0",
  parameters: {
    /** URL of the consent PDF (override if your app isn't served from the domain root). */
    pdf_url: {
      type: ParameterType.STRING,
      default: "/consent/consent.pdf",
    },
    title: {
      type: ParameterType.STRING,
      default: "Consent Form",
    },
    agree_label: {
      type: ParameterType.STRING,
      default: "I agree to participate in this study",
    },
    button_label: {
      type: ParameterType.STRING,
      default: "Start Experiment",
    },
  },
  data: {
    consent_id: { type: ParameterType.STRING },
    consent_date: { type: ParameterType.STRING },
    consent_given: { type: ParameterType.BOOL },
    rt: { type: ParameterType.INT },
  },
};

function makeConsentId() {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  return `CS-${Date.now().toString(36)}-${random}`.toUpperCase();
}

export class NavigateConsentPlugin {
  static info = info;

  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    const consentId = makeConsentId();
    const consentDate = new Date().toISOString();
    const startTime = performance.now();
    let finished = false;

    display_element.innerHTML = `
      <div style="
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
        background: #f5f5f5;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
          <h3 id="consent-title" style="text-align: center; color: #1a1a1a; margin-top: 0;"></h3>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <iframe
              id="consent-pdf"
              style="width: 100%; height: 500px; border: none; border-radius: 4px;"
              title="Consent Form PDF">
            </iframe>
            <p style="font-size: 14px; color: #666;">
              Can't see the document?
              <a id="consent-pdf-link" target="_blank" rel="noopener noreferrer">Open it in a new tab</a>.
            </p>
          </div>

          <div style="margin: 20px 0;">
            <label style="display: block; font-weight: 500; margin-bottom: 8px; cursor: pointer;">
              <input
                type="checkbox"
                id="consent-agree"
                style="width: 20px; height: 20px; margin-right: 10px; vertical-align: middle;"
              >
              <span id="consent-agree-label" style="vertical-align: middle;"></span>
            </label>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <button
              id="start-experiment"
              type="button"
              disabled
              style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 15px 40px;
                font-size: 18px;
                font-weight: 600;
                border-radius: 6px;
                cursor: not-allowed;
              "
            ></button>
          </div>

          <p style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">
            M: Toggle checkbox • ENTER: Start
          </p>
        </div>
      </div>
    `;

    // Set user-supplied values via the DOM (not string interpolation) to avoid HTML injection.
    const $ = (sel) => display_element.querySelector(sel);
    const checkbox = $("#consent-agree");
    const startButton = $("#start-experiment");

    $("#consent-title").textContent = trial.title;
    $("#consent-agree-label").textContent = trial.agree_label;
    startButton.textContent = trial.button_label;
    $("#consent-pdf").src = trial.pdf_url;
    $("#consent-pdf-link").href = trial.pdf_url;

    const updateButtonState = () => {
      startButton.disabled = !checkbox.checked;
      startButton.style.backgroundColor = checkbox.checked ? "#28a745" : "#6c757d";
      startButton.style.cursor = checkbox.checked ? "pointer" : "not-allowed";
    };

    const cleanup = () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      startButton.removeEventListener("click", endTrial);
      checkbox.removeEventListener("change", updateButtonState);
    };

    const endTrial = () => {
      // Guard: Enter on a focused button fires both our key handler and a native click.
      if (finished || !checkbox.checked) return;
      finished = true;
      cleanup();

      const data = {
        consent_id: consentId,
        consent_date: consentDate,
        consent_given: true,
        rt: Math.round(performance.now() - startTime),
      };

      display_element.innerHTML = "";
      this.jsPsych.finishTrial(data);
    };

    const handleKeyDown = (e) => {
      if (e.code === "KeyM") {
        // A focused checkbox already toggles itself natively; don't toggle twice.
        if (e.target === checkbox) return;
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        updateButtonState();
      } else if (e.code === "Enter") {
        // A focused button already fires a click on Enter; the click handler covers it.
        if (e.target === startButton) return;
        e.preventDefault();
        endTrial();
      }
    };

    // Stops M from "clicking" a focused Start button on keyup.
    const handleKeyUp = (e) => {
      if (e.code === "KeyM" && e.target !== checkbox) e.preventDefault();
    };

    checkbox.addEventListener("change", updateButtonState);
    startButton.addEventListener("click", endTrial);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    updateButtonState();
  }
}

export default NavigateConsentPlugin;
