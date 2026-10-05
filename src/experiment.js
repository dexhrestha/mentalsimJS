import { initJsPsych } from "jspsych";
import "jspsych/css/jspsych.css";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { params } from "./params.js";
import { parseCsv } from "./csv.js";
import { NavigateBlinkFixationPlugin } from "./trials/blink-fixation.js";
import { NavigateBreakScreenPlugin } from "./trials/break-screen.js";
import { NavigateFeedbackPlugin } from "./trials/feedback.js";
import { NavigateMovementPlugin } from "./trials/movement.js";
import { NavigateSamplePlugin } from "./trials/sample.js";
import { NavigateSpeedCuePlugin } from "./trials/speed-cue.js";
import { NavigateItiPlugin } from "./trials/iti.js";
import { preloadStimulusImages } from "./stimuli.js";
import "./style.css";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function setupInitialValues() {
  const search = new URLSearchParams(window.location.search);
  const config = decodeConfig(search.get("cfg"));
  const trialsPerRun = Number(config?.trialsPerRun ?? search.get("trialsPerRun") ?? 10);
  const devMode = config?.devMode ?? search.get("dev") === "1";
  return {
    subid: Number(config?.subid ?? search.get("subid") ?? params.subid),
    session: Number(config?.session ?? search.get("session") ?? params.session),
    seqid: Number(config?.seqid ?? search.get("seqid") ?? params.seqid),
    maxRuns: Number(config?.maxRuns ?? search.get("runs") ?? 1),
    trialsPerRun: Number.isFinite(trialsPerRun) && trialsPerRun > 0 ? trialsPerRun : 10,
    devMode: Boolean(devMode),
    cohortDir: config?.cohortDir ?? search.get("cohort") ?? params.cohortDir,
    participantUuid: config?.participantUuid ?? "",
    sessionId: config?.sessionId ?? ""
  };
}

function hasExperimentConfigInUrl() {
  const search = new URLSearchParams(window.location.search);
  return search.has("cfg") || (search.has("subid") && search.has("session") && search.has("seqid") && search.has("runs"));
}

function encodeConfig(config) {
  const json = JSON.stringify(config);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function decodeConfig(encoded) {
  if (!encoded) return null;
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function participantUrl(config) {
  const search = new URLSearchParams();
  search.set("cfg", encodeConfig(config));
  return `${window.location.origin}/?${search.toString()}`;
}

function createParticipantConfig(config) {
  const participantUuid = config.participantUuid || crypto.randomUUID();
  return {
    ...config,
    participantUuid,
    sessionId: `${participantUuid}_ses-${pad2(config.session)}`
  };
}

function navigateToExperiment(config) {
  window.location.assign(participantUrl(config));
}

function renderSetupForm(initialValues) {
  const target = document.querySelector("#jspsych-target");
  target.innerHTML = `
    <main class="setup-screen">
      <form class="setup-form" id="setup-form">
        <h1>Navigation Experiment</h1>
        <label>
          <span>Subject ID</span>
          <input name="subid" type="number" min="1" step="1" required value="${initialValues.subid}" />
        </label>
        <label>
          <span>Session</span>
          <input name="session" type="number" min="1" step="1" required value="${initialValues.session}" />
        </label>
        <label>
          <span>Sequence</span>
          <input name="seqid" type="number" min="1" step="1" required value="${initialValues.seqid}" />
        </label>
        <label>
          <span>Max runs</span>
          <input name="maxRuns" type="number" min="1" step="1" required value="${initialValues.maxRuns}" />
        </label>
        <label class="checkbox-label">
          <input name="devMode" type="checkbox" ${initialValues.devMode ? "checked" : ""} />
          <span>Dev mode: first 10 trials per run</span>
        </label>
        <label>
          <span>Cohort</span>
          <input name="cohortDir" type="text" required value="${initialValues.cohortDir}" />
        </label>
        <button type="submit">Start setup</button>
      </form>
    </main>
  `;

  return new Promise((resolve) => {
    target.querySelector("#setup-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const config = {
        subid: Number(formData.get("subid")),
        session: Number(formData.get("session")),
        seqid: Number(formData.get("seqid")),
        maxRuns: Number(formData.get("maxRuns")),
        cohortDir: String(formData.get("cohortDir")).trim()
      };
      navigateToExperiment(config);
      resolve(config);
    });
  });
}

function renderAdmin() {
  const search = new URLSearchParams(window.location.search);
  const expectedToken = import.meta.env.VITE_ADMIN_TOKEN;
  const providedToken = search.get("token") ?? "";
  const target = document.querySelector("#jspsych-target");

  if (!expectedToken || providedToken !== expectedToken) {
    target.innerHTML = `
      <main class="setup-screen">
        <section class="setup-form">
          <h1>Admin</h1>
          <p class="admin-message">Incorrect token code. Please contact the administrator.</a></p>
        </section>
      </main>
    `;
    return;
  }

  const initialValues = setupInitialValues();
  target.innerHTML = `
    <main class="setup-screen">
      <form class="setup-form" id="admin-form">
        <h1>Admin</h1>
        <label>
          <span>Subject ID</span>
          <input name="subid" type="number" min="1" step="1" required value="${initialValues.subid}" />
        </label>
        <label>
          <span>Session</span>
          <input name="session" type="number" min="1" step="1" required value="${initialValues.session}" />
        </label>
        <label>
          <span>Sequence</span>
          <input name="seqid" type="number" min="1" step="1" required value="${initialValues.seqid}" />
        </label>
        <label>
          <span>Max runs</span>
          <input name="maxRuns" type="number" min="1" step="1" required value="${initialValues.maxRuns}" />
        </label>
        <label>
          <span>Cohort</span>
          <input name="cohortDir" type="text" required value="${initialValues.cohortDir}" />
        </label>
        <label>
          <span>Participant UUID</span>
          <input name="participantUuid" type="text" value="${initialValues.participantUuid}" placeholder="Auto-generated if empty" />
        </label>
        <button type="submit">Generate URL</button>
        <label>
          <span>Participant URL</span>
          <textarea id="participant-url" readonly rows="4"></textarea>
        </label>
        <button type="button" id="copy-url">Copy URL</button>
      </form>
    </main>
  `;

  const form = target.querySelector("#admin-form");
  const output = target.querySelector("#participant-url");
  const copyButton = target.querySelector("#copy-url");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const config = createParticipantConfig({
      subid: Number(formData.get("subid")),
      session: Number(formData.get("session")),
      seqid: Number(formData.get("seqid")),
      maxRuns: Number(formData.get("maxRuns")),
      devMode: formData.get("devMode") === "on",
      trialsPerRun: 10,
      cohortDir: String(formData.get("cohortDir")).trim(),
      participantUuid: String(formData.get("participantUuid")).trim()
    });
    output.value = participantUrl(config);
  });

  copyButton.addEventListener("click", async () => {
    if (!output.value) return;
    await navigator.clipboard.writeText(output.value);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy URL";
    }, 1200);
  });
}

async function loadTrials(config) {
  const inputPath = `/input/${config.cohortDir}/subj-${pad2(config.subid)}/ses-${pad2(config.session)}/input.csv`;
  const response = await fetch(inputPath);
  if (!response.ok) throw new Error(`Could not load ${inputPath}: ${response.status}`);
  const rows = parseCsv(await response.text());
  if (rows.length === 0 || !Object.prototype.hasOwnProperty.call(rows[0], "is_probe")) {
    throw new Error(`Invalid or missing trial CSV at ${inputPath}. Check cohort, subject, and session.`);
  }
  return rows.filter((row) => Number(row.is_probe) === 0);
}

async function configureParams(config) {
  const sequencePath = `/input/${config.cohortDir}/category_sequences.csv`;
  const response = await fetch(sequencePath);
  if (!response.ok) throw new Error(`Could not load ${sequencePath}: ${response.status}`);

  const rows = parseCsv(await response.text());
  const sequence = rows.find((row) => Number(row.subid ?? row.seqid) === config.seqid);
  if (!sequence) throw new Error(`No category sequence found for sequence ${config.seqid}.`);

  params.subid = config.subid;
  params.session = config.session;
  params.seqid = config.seqid;
  params.cohortDir = config.cohortDir;
  params.categories = Array.from({ length: 9 }, (_, index) => sequence[`pos${index + 1}`]);
  params.participant.direction = Number(sequence.direction) * -1;
}

function showFatalError(error) {
  document.querySelector("#jspsych-target").innerHTML = `
    <main class="start-screen">
      <h1>Experiment error</h1>
      <p>${error.message}</p>
    </main>
  `;
  console.error(error);
}

async function saveExperimentData({ jsPsych, config, selectedRuns }) {
  const payload = {
    savedAt: new Date().toISOString(),
    experiment: "navigate",
    sessionId: config.sessionId,
    participantUuid: config.participantUuid,
    subject: config.subid,
    session: config.session,
    sequence: config.seqid,
    cohort: config.cohortDir,
    selectedRuns,
    rows: jsPsych.data.get().values(),
    csv: jsPsych.data.get().csv()
  };

  const response = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Data save failed: ${response.status}`);
  }

  return response.json();
}


async function main() {
  // Admin setup is only available at /admin.
  if (window.location.pathname.startsWith("/admin")) {
    renderAdmin();
    return;
  }

  // The participant page must receive a configuration generated by /admin.
  const search = new URLSearchParams(window.location.search);

  if (!search.has("cfg")) {
    document.querySelector("#jspsych-target").innerHTML = `
      <main class="start-screen">
        <h1>Navigation Experiment</h1>
        <p>Request participant link from the admin. You can book your experiment at : <a href="http://experiments.dipeshrestha.com.np/meg">here </a></p>
      </main>
    `;
    return;
  }

  const config = setupInitialValues();

  // Make sure the cfg parameter actually decoded to a usable configuration.
  if (
    !Number.isFinite(config.subid) ||
    config.subid < 1 ||
    !Number.isFinite(config.session) ||
    config.session < 1 ||
    !Number.isFinite(config.seqid) ||
    config.seqid < 1 ||
    !Number.isFinite(config.maxRuns) ||
    config.maxRuns < 1 ||
    !config.cohortDir ||
    !config.participantUuid ||
    !config.sessionId
  ) {
    document.querySelector("#jspsych-target").innerHTML = `
      <main class="start-screen">
        <h1>Navigation Experiment</h1>
        <p>Request participant link from the admin. You can book your experiment at : <a href="http://experiments.dipeshrestha.com.np/meg">here </a></p>
      </main>
    `;
    return;
  }

  await configureParams(config);

  const jsPsych = initJsPsych({
    display_element: "jspsych-target",
    async on_finish() {
      try {
        const result = await saveExperimentData({ jsPsych, config, selectedRuns });
        document.querySelector("#jspsych-target").innerHTML = `
          <main class="start-screen">
            <h1>Done</h1>
            <p>Data saved.</p>
            <p>${result.path ?? result.url ?? ""}</p>
          </main>
        `;
      } catch (error) {
        document.querySelector("#jspsych-target").innerHTML = `
          <main class="start-screen">
            <h1>Done</h1>
            <p>Data could not be saved automatically.</p>
            <p>${error.message}</p>
          </main>
        `;
        console.error(error);
      }
    }
  });

  const rows = await loadTrials(config);
  await preloadStimulusImages(params);

  const maxRuns =
    Number.isFinite(config.maxRuns) && config.maxRuns > 0
      ? config.maxRuns
      : 1;

  const selectedRuns = [
    ...new Set(rows.map((row) => Number(row.run)))
  ]
    .sort((a, b) => a - b)
    .slice(0, maxRuns);

  const rowsByRun = selectedRuns.flatMap((run) =>
    (config.devMode
      ? rows.filter((row) => Number(row.run) === run).slice(0, 10)
      : rows.filter((row) => Number(row.run) === run))
  );

  const maxTrialsParam = new URLSearchParams(window.location.search).get("n");

  const selectedRows = maxTrialsParam
    ? rowsByRun.slice(0, Number(maxTrialsParam))
    : rowsByRun;

  const timeline = [
    {
      type: htmlKeyboardResponse,
      stimulus: `
        <main class="start-screen">
          <h1>Navigation Experiment</h1>
          <p>Subject ${params.subid}, session ${params.session}, sequence ${params.seqid}.</p>
          <p>Press space to start. Then hold space during fixation.</p>
        </main>
      `,
      choices: [" "]
    }
  ];

  selectedRuns.forEach((run, runIndex) => {
    const runRows = selectedRows.filter((row) => Number(row.run) === run);

    runRows.forEach((row) => {
      if (Number(row.speed_cue_dur) > 0) {
        timeline.push({
          type: NavigateSpeedCuePlugin,
          row,
          params
        });
      }

      timeline.push({
        type: NavigateBlinkFixationPlugin,
        row,
        params
      });

      timeline.push({
        type: NavigateSamplePlugin,
        row,
        params
      });

      timeline.push({
        type: NavigateMovementPlugin,
        row,
        params
      });

      timeline.push({
        type: NavigateFeedbackPlugin,
        row,
        params
      });

      timeline.push({
        type: NavigateItiPlugin,
        row,
        params
      });
    });

    if (runIndex < selectedRuns.length - 1) {
      timeline.push({
        type: NavigateBreakScreenPlugin,
        run,
        params
      });
    }
  });

  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <main class="start-screen">
        <h1>Done</h1>
        <p>Press space to show data.</p>
      </main>
    `,
    choices: [" "]
  });

  jsPsych.run(timeline);
}

main().catch(showFatalError);
