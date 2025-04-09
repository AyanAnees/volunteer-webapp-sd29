@echo off
echo Running script to fix remaining attribution issues...

cd C:\Coding\volunteer-webapp-final-working

REM Set environment variable to suppress the warning
set FILTER_BRANCH_SQUELCH_WARNING=1

REM Check if Git Bash exists in standard location
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" -c "./fix-remaining-attribution.sh"
) else (
    REM Try alternate location
    if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
        "C:\Program Files (x86)\Git\bin\bash.exe" -c "./fix-remaining-attribution.sh"
    ) else (
        echo Git Bash not found in standard locations.
        echo Please run the fix-remaining-attribution.sh script manually using Git Bash.
        exit /b 1
    )
)

echo Git history rewrite complete!
echo.
echo Next steps:
echo 1. Verify contributions with: git shortlog -sne --all
echo 2. Force push to GitHub with: git push -f origin main
echo 3. Check GitHub contributors page to confirm proper attribution
echo.
echo Would you like to push changes to GitHub now? (Y/N)
set /p PUSH_CHOICE=

if /i "%PUSH_CHOICE%"=="Y" (
    echo Force pushing changes to GitHub (this may take a while)...
    git push -f origin main
    echo Process complete. GitHub metrics should now show proper team contributions.
    echo You may need to wait a few minutes for GitHub to update the contribution graphs.
) else (
    echo Changes have been applied locally but not pushed to GitHub.
)

pause
