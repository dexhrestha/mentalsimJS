# Consent Form Guide

This document provides information about the consent form implementation in MentalSim JS.

## Overview

The experiment now includes an informed consent screen that must be completed before participants can begin the experiment.

## Consent Screen Features

- **Consent ID**: Automatically generated unique identifier for each participant's consent
- **Consent Date**: Timestamp of when consent was given
- **Complete Information**: Covers all required elements of informed consent:
  - Introduction and purpose
  - Procedures
  - Risks and benefits
  - Confidentiality
  - Voluntary participation
  - Contact information
  - Research participant rights

## Consent Form Details

The consent form includes 10 sections:

1. **Introduction** - Purpose of the study and what to expect
2. **Purpose** - Specific research goals
3. **Procedures** - Step-by-step description of participation
4. **Risks and Discomforts** - Potential risks and how to discontinue
5. **Benefits** - Possible contributions to research
6. **Confidentiality** - How data will be protected
7. **Voluntary Participation and Withdrawal** - Participant rights
8. **Compensation** - Compensation information (if applicable)
9. **Contact Information** - Who to contact with questions
10. **Consent** - Confirmation of understanding

## Data Collection

The consent screen collects the following data:

- Consent ID (unique identifier)
- Consent date (timestamp)
- Participant's agreement (via timeline record)

This data is saved along with experiment results.

## Customization

You can customize the consent form by editing `src/trials/consent.js`:

1. Replace bracketed text (e.g., `[Add name and contact information]`)
2. Modify sections to fit your specific study requirements
3. Adjust the information to match your institution and IRB requirements

## Consent ID Format

Consent IDs are generated in the format: `CS-[TIMESTAMP]`
- `CS` = Consent
- Timestamp = Current time in base36 encoding (e.g., `ABC123XYZ`)

Example: `CS-ABC123XYZ`

## Testing

To test the consent screen:

1. Start the development server: `npm run dev`
2. Access the experiment
3. Complete the consent form
4. Proceed to the setup screen

## Privacy Considerations

- Consent ID is used to link consent to participant data
- No personally identifiable information is collected unless manually entered during setup
- Data is stored as configured in your backend API

## Legal Requirements

Ensure your consent form complies with:
- Your institution's IRB requirements
- Local regulations for research involving human subjects
- Applicable privacy and data protection laws

## Contact

For questions about the consent implementation, contact: [Your Name]
