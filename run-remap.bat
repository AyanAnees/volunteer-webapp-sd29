@echo off
echo Running author remapping script...
cd C:\Coding\volunteer-webapp-final-working

REM Check if Git Bash exists in standard location
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" -c "./remap-authors.sh"
) else (
    REM Try alternate location
    if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
        "C:\Program Files (x86)\Git\bin\bash.exe" -c "./remap-authors.sh"
    ) else (
        echo Git Bash not found in standard locations.
        echo Please run the remap-authors.sh script manually using Git Bash.
        exit /b 1
    )
)

echo Remapping complete!
echo.
echo Force pushing to GitHub...
git push -f origin main

echo.
echo Process complete. GitHub metrics should now show proper team contributions.
echo You may need to wait a few minutes for GitHub to update the contribution graphs.
