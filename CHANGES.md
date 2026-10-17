# Consent Screen Implementation - Changes Summary

## Overview
Added a mandatory informed consent screen to the MentalSim JS experiment that participants must complete before beginning the experiment.

## Files Created/Modified

### 1. Created Files

#### `jspsych_mentalsim/src/trials/consent.js`
- New JsPsych plugin that extends `htmlKeyboardResponse`
- Displays a comprehensive informed consent form
- Automatically generates unique consent ID (`CS-[TIMESTAMP]`)
- Captures consent timestamp
- Includes 10 sections covering all IRB-required elements

#### `jspsych_mentalsim/public/consent.html`
- Standalone printable consent form
- Can be viewed in browser and printed/saved as PDF
- Includes consent ID and date generation

#### `jspsych_mentalsim/public/consent-printable.html`
- Optimized version for printing
- CSS for print-friendly layout
- Includes "Print / Save as PDF" button

#### `jspsych_mentalsim/public/CONSENT_GUIDE.md`
- Detailed documentation about consent implementation
- Includes customization instructions
- Privacy considerations
- Legal requirements checklist

### 2. Modified Files

#### `jspsych_mentalsim/src/experiment.js`
- **Line 6**: Added import for `NavigateConsentPlugin`
  ```javascript
  import { NavigateConsentPlugin } from "./trials/consent.js";
  ```
- **Line 417-431**: Added consent screen to experiment timeline
  - Consent screen is now the first element in the timeline
  - Followed by a welcome message

#### `jspsych_mentalsim/README.md`
- Added "Consent Screen" section after "Features"
- Documented consent workflow
- Added notes about consent customization
- Updated participant flow to include consent step

## Consent Form Sections

1. **Introduction** - Purpose and context of the study
2. **Purpose** - Specific research goals
3. **Procedures** - Step-by-step description of participation
4. **Risks and Discomforts** - Potential risks and withdrawal option
5. **Benefits** - Possible contributions to research
6. **Confidentiality** - How data will be protected
7. **Voluntary Participation and Withdrawal** - Participant rights
8. **Compensation** - Compensation information (placeholder)
9. **Contact Information** - PI and institution contact details
10. **Rights as a Research Participant** - IRB contact information
11. **Consent** - Confirmation statements

## Data Collection

The consent screen collects the following data:

- `consent_id`: Unique identifier in format `CS-[TIMESTAMP]`
- `consent_date`: ISO timestamp of when consent was given

This data is automatically saved to the experiment results along with all other behavioral data.

## Customization

To customize the consent form:

1. Open `src/trials/consent.js`
2. Replace bracketed text (e.g., `[Add name and contact information]`)
3. Modify sections to match your specific study requirements
4. Ensure compliance with your institution's IRB requirements

## Testing

To test the consent screen:

1. Start development server: `npm run dev`
2. Access the experiment at `http://127.0.0.1:5173`
3. View consent screen with auto-generated consent ID
4. Press SPACE to continue to setup screen
5. Verify consent data is saved with experiment results

## Privacy Considerations

- Consent ID is used to link consent to participant data
- No personally identifiable information is collected unless manually entered during setup
- Data is stored as configured in your backend API
- Consent ID format: `CS-[TIMESTAMP]` ensures uniqueness

## Build Status

✅ Successfully built with `npm run build`

## Compatibility

- Compatible with JsPsych v8.2.1
- Compatible with Vite v6.0.0
- Uses standard JsPsych plugin pattern
- Extends `htmlKeyboardResponse` plugin
