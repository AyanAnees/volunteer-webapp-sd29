@echo off
echo Fixing Hanna's commit attribution...

cd C:\Coding\volunteer-webapp-final-working

REM Check if Git Bash exists in standard location
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" -c "./fix-hanna-attribution.sh"
) else (
    REM Try alternate location
    if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
        "C:\Program Files (x86)\Git\bin\bash.exe" -c "./fix-hanna-attribution.sh"
    ) else (
        echo Git Bash not found in standard locations.
        echo Please run the fix-hanna-attribution.sh script manually using Git Bash.
        exit /b 1
    )
)

echo Commit history update complete!
echo Force pushing changes to GitHub...
git push -f origin main

echo Process complete. GitHub metrics should now show Hanna's contributions correctly.
echo You may need to wait a few minutes for GitHub to update the contribution graphs.
