# Project Context: GitHub Repository Contribution Attribution Fix

## Project Overview
- Type: Git Repository Contribution Attribution Correction
- Start Date: April 8, 2025
- Last Updated: April 8, 2025

## Project Description
This project aims to fix GitHub contribution attribution issues in a volunteer web application that combines elements from two repositories:
1. **Original Repository** (`volunteer-webapp-sd29`): Contains 42 original commits (Feb-Mar 2025)
2. **Reorganized Repository** (`volunteer-webapp-sd29-reorganized`): Contains a newer, more organized structure

## Team Members and GitHub Accounts
* **Ayan Anees**: https://github.com/AyanAnees - Email: ayananees007@gmail.com
* **Haley Trinh**: https://github.com/haleytri - Email: haleytrinh7@gmail.com
* **Hanna Asfaw**: https://github.com/Hannadem12 - Email: hannadasfaw@gmail.com
* **Sameer Gul**: https://github.com/SameerGul123 - Email: sameergul6619@gmail.com

## Target Contribution Distribution
* Haley Trinh: ~28% (feature: volunteer matching & history)
* Ayan Anees: ~27% (feature: login & authentication)
* Sameer Gul: ~22% (feature: user profile management)
* Hanna Asfaw: ~20% (feature: event management)

## Current State
- Working directory established at `C:\Coding\volunteer-webapp-final-working`
- Repository successfully recreated with logical progression of commits
- Several scripts created to fix attribution issues:
  - `fix-authors-committers.sh`: Makes author and committer fields match
  - `fix-hanna-attribution.sh`: Specifically fixes Hanna's commits
  - `fix-all-commits.sh`: Comprehensive script to fix all attribution issues
  - Various .bat files to run these scripts on Windows
- `.mailmap` file created to associate correct emails with contributors

## Current Issues
1. **Author/Committer Mismatch**: Some commits have different "author" and "committer" fields, causing GitHub not to link them to the correct profiles
2. **Hanna's Contributions**: Hanna's commits aren't showing up in contribution statistics
3. **Team User**: Some commits are attributed to a generic "Team" user rather than actual team members

## Recent Changes
- Initial context file creation
- Created fix-remaining-attribution.sh to address inconsistent naming issues
- Updated .mailmap file to use GitHub usernames consistently
- Added run-fix-remaining.bat for Windows execution

## Next Steps
1. Run the fix-remaining-attribution.sh script to fix the detected issues
2. Verify that all Hanna's commits are attributed to Hannadem12 with the correct email
3. Check that all commits use consistent identities (GitHub usernames)
4. Push the changes to GitHub
5. Confirm contribution statistics match the desired percentages
6. Update CONTRIBUTORS.md with the final statistics

## Important Files
- `fix-all-commits.sh`: Main script to fix all attribution issues
- `fix-hanna-attribution.sh`: Script specifically for Hanna's commits
- `fix-remaining-attribution.sh`: Script to fix remaining attribution issues
- `.mailmap`: Maps contributor identities to correct GitHub accounts
- `CONTRIBUTORS.md`: Documents team contributions
- `run-fix-remaining.bat`: Windows batch file to run the fix-remaining-attribution.sh script
