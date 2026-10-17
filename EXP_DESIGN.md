# Mental Navigation Experiment — Updated Protocol

## 1. Research Objective

The primary objective is to investigate whether internally guided navigation through a learned sequence generates rhythmic neural activity at the frequency of the imagined traversal.

We hypothesize that mental navigation will produce frequency-specific MEG responses corresponding to the instructed navigation speed, even in the absence of rhythmic visual stimulation.

### Primary predictions

- **Slow navigation (1.6 Hz):** increased neural activity at 1.6 Hz.
- **Fast navigation (2.0 Hz):** increased neural activity at 2.0 Hz.
- Frequency-specific responses will persist during the invisible portion of navigation.

The primary objective does not require demonstrating the sequential reinstatement of individual landmark identities. The observed rhythmic activity could reflect internal timing, periodic attentional updating, or sequential mental navigation.

## 2. Participants and Counterbalancing

We will recruit **40 participants**.

Each participant will learn one of four image sequences in one assigned direction.

| Sequence | Forward | Reverse | Total |
|---|---:|---:|---:|
| 1 | 5 | 5 | 10 |
| 2 | 5 | 5 | 10 |
| 3 | 5 | 5 | 10 |
| 4 | 5 | 5 | 10 |
| **Total** | **20** | **20** | **40** |

Each sequence contains 18 landmarks. Sequence identity and direction will be counterbalanced across participants.

**To verify:** The route must support up to 18 transitions after the starting image, including any necessary wraparound or repeated landmarks.

## 3. Exploration Task

### Objective

Participants learn the assigned landmark sequence and its traversal direction.

### Instructions

> You are a starship captain travelling through space. Your mission is to learn a route marked by a sequence of images called landmarks.
>
> Press and hold the GO key to travel through the route. Pay attention to the landmarks and remember their order.
>
> Later, you will navigate this route and attempt to stop at a target landmark.

### Duration

Approximately 5 minutes during designated sessions.

## 4. Navigation Task

### General procedure

Participants navigate through the learned sequence by pressing and holding the GO key.

At the beginning of each trial, a starting landmark and a target landmark are presented. Participants must navigate from the starting position and release the GO key when they believe they have reached the target.

The spaceship moves at a constant speed within each block.

### Navigation parameters

| Parameter | Value |
|---|---|
| Sequence length | 18 landmarks |
| Start-to-target distance | 12–18 landmark transitions |
| Slow navigation | 1.6 landmarks/s |
| Fast navigation | 2.0 landmarks/s |
| Slow landmark interval | 625 ms |
| Fast landmark interval | 500 ms |
| Correct response | Within ±1 landmark of target |
| Speed changes | Between blocks |
| Feedback | Trial-by-trial during training |

### Visual navigation trials

The intermediate landmarks are visible as the spaceship moves through the learned sequence.

### Mental navigation trials

The first three landmarks following the starting image are visible. After the third landmark, the remaining landmarks are invisible. No visual motion or rhythmic visual stimulation is presented during this period.

Participants must continuously maintain an estimate of their position while the GO key remains pressed.

| Distance (transitions) | Invisible transitions | Slow duration | Fast duration |
|---:|---:|---:|---:|
| 12 | 9 | 5.63 s | 4.50 s |
| 13 | 10 | 6.25 s | 5.00 s |
| 14 | 11 | 6.88 s | 5.50 s |
| 15 | 12 | 7.50 s | 6.00 s |
| 16 | 13 | 8.13 s | 6.50 s |
| 17 | 14 | 8.75 s | 7.00 s |
| 18 | 15 | 9.38 s | 7.50 s |

Durations represent nominal travel times to the target, not necessarily the actual produced durations.

### Participant instructions

#### Screen 1 — Introduction

> You are a starship captain travelling through space. Your mission is to stop at the correct landmark.
>
> Press and hold the GO key to begin.

*[Insert illustration]*

#### Screen 2 — Starting and target landmarks

> At the beginning of each trial, you will see the starting landmark and the target landmark.
>
> When the target image disappears, continue holding the GO key to travel through the sequence.
>
> Remember the route you learned and release the GO key when you believe you have reached the target landmark.

*[Insert example showing starting and target images]*

#### Screen 3 — Feedback

> Your goal is to stop at the target landmark.
>
> After stopping, you will receive feedback indicating how far your stopping position was from the target.
>
> A green dot represents your stopping position. Feedback will indicate the number of landmarks separating your position from the target.

*[Insert feedback illustration]*

#### Screen 4 — Unexpected stopping probes

> Sometimes your spaceship will break down and stop unexpectedly before reaching the target, even while you are holding the GO key.
>
> When this happens, you must identify your current position along the route.
>
> Select the correct landmark using the left or right response button.

*[Insert probe illustration]*

#### Screen 5 — Navigation conditions

> The spaceship can travel at two speeds:
>
> - **Slow:** 1.6 landmarks per second.
> - **Fast:** 2.0 landmarks per second.
>
> You will also encounter two types of space regions:
>
> - **Light region:** Landmarks remain visible as you travel.
> - **Dark region:** After the first three visible landmarks, the remaining landmarks become invisible.
>
> Speed and visibility conditions will be indicated at the beginning of each block.
>
> When travelling through dark regions, continue tracking your position even though the landmarks cannot be seen.
>
> Remember: your spaceship continues moving for as long as you hold the GO key.

*[Insert speed and visibility illustration]*

## 5. Behavioral Measurements

### Normal navigation trials

For each trial, record:

- Participant, session, run and block.
- Assigned sequence and direction.
- Start and target positions.
- Number of landmark transitions.
- Navigation speed and visibility condition.
- Required travel duration.
- Produced travel duration.
- Signed stopping error, in landmark units.
- Absolute stopping error, in landmark units.
- Whether the response was correct (absolute error ≤ 1 landmark).

### Probe trials

Unexpected stopping probes assess participants' ability to estimate their current position.

Record the actual position, reported position, signed and absolute positional errors, and response time. Probes should sample multiple unpredictable positions during invisible navigation.

### Behavioral analysis

Primary behavioral summaries will include:

- Proportion of trials within ±1 landmark.
- Mean absolute and signed stopping errors.
- Regression slope between required and produced durations.
- Within-participant variability.
- Effects of speed, distance and training session.

## 6. Preliminary Behavioral Findings

Behavioral observations from the training sessions suggest that participants can learn to navigate at the instructed speeds, although substantial individual differences remain.

### Navigation accuracy

Using a correctness criterion of ±1 landmark:

- **Day 2:** approximately 52% mean accuracy across the displayed sample.
- **Day 4:** approximately 84% mean accuracy across the displayed sample.

These values are approximate descriptive estimates from the supplied plots, which show different sets of participants, rather than a formal matched longitudinal analysis.

Several participants achieved accuracy above 80% by Day 4, while others remained less accurate.

### Temporal production

Produced duration generally increased with required duration, but some participants systematically underproduced longer intervals.

A slope below 1 indicates temporal compression, although this does not identify whether the underlying cause is internal navigation speed, timing bias, or response strategy.

### Distribution of correct-trial errors

Absolute errors within correct trials (0–1 landmark), pooled across participants and speeds, appeared approximately uniform. This suggests that successful trials include a range of stopping precision. The distribution must be interpreted in light of the correctness selection criterion.

### Implications

The preliminary results support retaining the existing navigation speeds, target distances and training structure for MEG piloting.

Performance-based monitoring is recommended, but a formal training or exclusion threshold should be established only after evaluating the complete behavioral dataset.

## 7. Localization Task

Participants will passively view images from the learned sequence. They will maintain central fixation and respond when an image that does not belong to their learned sequence appears.

### Instructions

> Look at the center of the screen.
>
> You will see a series of images. Press the response button whenever you see an image that was not part of the sequence you learned.

### Purpose

The current task assesses recognition of the learned landmark set.

If the localization task is intended to provide an independent visual MEG localizer, its stimulus timing and visual-identity contrasts must be specified separately.

## 8. Training and Experimental Schedule

### Session 1 — Thursday (90 minutes)

- Exploration: 5 minutes.
- Navigation:
  - Run 1: Mixed visual and mental blocks, including fast and slow speeds.
  - Runs 2–6: Visual navigation.
- Original listed Run 1 order: Visual Fast, Visual Slow, Mental Fast, Visual Slow, Visual Fast, Mental Slow.
- **To check:** Block order for intended counterbalancing.

### Session 2 — Friday (90 minutes)

- Exploration: 5 minutes.
- Navigation:
  - Initial blocks: Visual navigation.
  - Subsequent runs: Mental navigation.
- Original specification: Run 1, Blocks 1–2 visual; Runs 3–6 mental.
- **To clarify:** Run 2 assignment remains unspecified.

### Session 3 — Saturday (30 minutes)

Three online practice sessions.

### Session 4 — Sunday (30 minutes)

Three online practice sessions.

### Session 5 — Monday (90 minutes)

- Exploration: 5 minutes.
- Navigation: All runs in the mental-navigation condition.

### Session 6 — Tuesday: MEG (180 minutes)

| Component | Planned duration |
|---|---:|
| MEG preparation | 30 min |
| Exploration | 5 min |
| Mental navigation | 90 min |
| Localization | 15 runs / 10 min |
| Post-experiment questionnaire | 20 min |
| Remaining time | 35 min |

The remaining time provides a possible allowance for instructions, breaks, and transitions.

**To verify:** The feasibility of completing 15 localization runs in 10 minutes.

## 9. MEG Hypotheses and Analysis

### Primary hypothesis

Neural activity during invisible mental navigation will exhibit frequency-specific modulation corresponding to the instructed navigation speed.

Expected fundamental frequencies:

- **Slow navigation:** 1.6 Hz.
- **Fast navigation:** 2.0 Hz.

### Primary statistical test

Test the interaction between instructed navigation speed and spectral response frequency.

The predicted pattern is:

- Greater frequency-specific response at 1.6 Hz during slow than fast navigation.
- Greater frequency-specific response at 2.0 Hz during fast than slow navigation.

### Primary analysis

- Use artifact-free mental-navigation trials.
- Analyze the invisible navigation segment, excluding the initial sensory transition and response-related activity according to predefined analysis windows.
- Use comparable epoch durations where appropriate, and evaluate the robustness of the results to variable trial lengths.
- Estimate frequency-specific neural responses relative to neighboring spectral frequencies or an appropriate background model.

### Secondary analyses

#### Correct-trial analysis

Repeat the spectral analysis using trials in which participants stop within ±1 landmark of the target. This tests whether frequency-specific activity is detectable during behaviorally successful navigation.

#### Temporal persistence

Examine whether the frequency-specific response is sustained during the invisible segment rather than being restricted to the initial transition after visual stimulation.

#### Behavioral correlations

Test whether frequency-specific neural responses are associated with:

- Absolute stopping error.
- Signed stopping error.
- Temporal production accuracy.
- Individual differences in performance.

#### Visual-navigation positive control

Use visible-navigation trials to assess whether the analysis can detect frequency-specific activity when landmarks are externally presented at the corresponding speed.

### Important methodological considerations

- The two target frequencies differ by 0.4 Hz.
- The shortest nominal invisible-navigation interval lasts 4.5 seconds.
- Spectral resolution and leakage must be evaluated for the chosen analysis windows.
- Trial selection can change duration distributions and spectral sensitivity.
- Internally generated rhythms may not be perfectly phase-aligned across trials.
- Trial counts and artifact rejection rates should be determined separately for each speed.

## 10. Recommendations Before the Full MEG Study

No major changes to the navigation paradigm are currently recommended.

Before collecting the full sample:

1. Complete the behavioral analysis across participants and sessions.
2. Determine the expected number of correct, artifact-free trials per speed.
3. Evaluate frequency-recovery sensitivity using simulations with realistic trial durations and noise.
4. Pilot the MEG paradigm to estimate spectral signal-to-noise ratio.
5. Define the spectral analysis windows and primary statistical contrast before confirmatory testing.
6. Finalize unresolved block scheduling and localization details.

## 11. Expected Contribution

The experiment will test whether internally guided navigation through a learned sequence is accompanied by rhythmic neural activity whose frequency adapts to the instructed movement speed.

Evidence of a speed-dependent spectral response during invisible navigation would support the hypothesis that internally generated cognitive dynamics can organize neural activity at behaviorally relevant temporal frequencies, even without ongoing rhythmic sensory input.

The experiment is not designed to distinguish conclusively between periodic timing, attentional updating, and landmark-by-landmark reinstatement as the source of that rhythm.
