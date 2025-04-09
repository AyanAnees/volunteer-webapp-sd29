@echo off
echo Running commit history rewrite...

cd C:\Coding\volunteer-webapp-final-working

REM Set environment variable to suppress the warning
set FILTER_BRANCH_SQUELCH_WARNING=1

REM Check if Git Bash exists in standard location
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" -c "./rewrite-history.sh"
) else (
    REM Try alternate location
    if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
        "C:\Program Files (x86)\Git\bin\bash.exe" -c "./rewrite-history.sh"
    ) else (
        echo Git Bash not found in standard locations.
        echo Please run the rewrite-history.sh script manually using Git Bash.
        exit /b 1
    )
)

echo Git history rewrite complete!
echo Force pushing changes to GitHub (this may take a while)...
git push -f origin main

echo Process complete. GitHub metrics should now show proper team contributions.
echo You may need to wait a few minutes for GitHub to update the contribution graphs.
