let audioContext = null;

export function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  return audioContext;
}

export async function resumeAudioContext() {
  const context = getAudioContext();
  if (!context) return null;
  if (context.state === "suspended") await context.resume();
  return context;
}

export function scheduleTone(context, startTime, durationSec, frequencyHz, volume) {
  if (!context || durationSec <= 0 || volume <= 0) return null;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attackSec = Math.min(0.01, durationSec / 4);
  const releaseSec = Math.min(0.02, durationSec / 3);
  const safeStart = Math.max(context.currentTime, startTime);
  const stopTime = safeStart + durationSec;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequencyHz, safeStart);

  gain.gain.setValueAtTime(0, safeStart);
  gain.gain.linearRampToValueAtTime(volume, safeStart + attackSec);
  gain.gain.setValueAtTime(volume, Math.max(safeStart + attackSec, stopTime - releaseSec));
  gain.gain.linearRampToValueAtTime(0, stopTime);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(safeStart);
  oscillator.stop(stopTime);

  return { oscillator, gain, startTime: safeStart, stopTime };
}

export function stopScheduledTones(context, tones, fadeSec = 0.005) {
  if (!context) return;
  const stopTime = context.currentTime + fadeSec;

  tones.forEach((tone) => {
    if (!tone) return;

    try {
      tone.gain.gain.cancelScheduledValues(context.currentTime);
      tone.gain.gain.setValueAtTime(tone.gain.gain.value, context.currentTime);
      tone.gain.gain.linearRampToValueAtTime(0, stopTime);
      tone.oscillator.stop(stopTime);
    } catch {
      // The oscillator may already have stopped naturally.
    }
  });
}

export function scheduleAlphaPeakTones(context, options) {
  const {
    movementDurMs,
    peakIntervalSec,
    soundDurationSec,
    frequencyHz,
    volume
  } = options;

  if (!context || peakIntervalSec <= 0 || soundDurationSec <= 0) return { events: [], tones: [] };

  const events = [];
  const tones = [];
  const onsetTime = context.currentTime;
  const movementDurSec = movementDurMs / 1000;

  for (let peakSec = peakIntervalSec; peakSec < movementDurSec; peakSec += peakIntervalSec) {
    const startTime = onsetTime + peakSec - soundDurationSec / 2;
    tones.push(scheduleTone(context, startTime, soundDurationSec, frequencyHz, volume));
    events.push({
      sound_start_sec: peakSec - soundDurationSec / 2,
      sound_midpoint_sec: peakSec,
      sound_end_sec: peakSec + soundDurationSec / 2
    });
  }

  return { events, tones };
}
