export const params = {
  bgColor: "rgb(25, 25, 25)",
  fgColor: "rgb(255, 255, 255)",
  fixColor: "rgb(0, 255, 0)",
  screenWidthPx: 1920,
  screenHeightPx: 1080,
  screenWidthCm: 75,
  viewingDistCm: 75,
  central: true,
  startYDeg: 0,
  targetYDeg: 8,
  ildDeg: 5,
  lmHeightDeg: 5,
  lmWidthDeg: 5,
  fixSizeDeg: 1,
  speedCueOffsetDeg: 6,
  speedTextDeg: 1.5,
  speedCueLoops: 1,
  lang: 0,
  breakDurMs: 60000,
  blinkFixRedDurMs: 800,
  blinkFixOffDurMs: 50,
  blinkFixGreenDurMs: 1000,
  cohortDir: "cohort_sept",
  subid: 7,
  session: 1,
  seqid: 1,
  stimulusBasePath: "/stim",
  categories: ["hand", "house", "face", "animal", "tool", "leg", "object", "food", "shape"],
  nCatImages: 2,
  participant: {
    direction: -1
  }
};

export function degToPx(deg, p = params) {
  const cm = 2 * p.viewingDistCm * Math.tan((deg * Math.PI) / 360);
  return (cm / p.screenWidthCm) * p.screenWidthPx;
}

export function layoutParams(p = params) {
  return {
    lmWidthPx: degToPx(p.lmWidthDeg, p),
    lmHeightPx: degToPx(p.lmHeightDeg, p),
    ildPx: degToPx(p.ildDeg, p),
    startYPx: degToPx(p.startYDeg, p),
    targetYPx: degToPx(p.targetYDeg, p),
    fixSizePx: Math.round(degToPx(p.fixSizeDeg, p)),
    speedCueOffsetPx: degToPx(p.speedCueOffsetDeg, p),
    speedTextPx: Math.round(degToPx(p.speedTextDeg, p))
  };
}
