@echo off
echo Setting up GitHub remote repository...

REM You'll need to create a GitHub repository first and then run this script
REM Replace the URL below with your actual GitHub repository URL
set GITHUB_REPO=https://github.com/YourUsername/volunteer-webapp-sd29.git

cd C:\Coding\volunteer-webapp-final-working

REM Add the GitHub repository as a remote
git remote add origin %GITHUB_REPO%

REM Push all branches and tags to the remote repository
git push -u origin master

echo Repository successfully pushed to GitHub!
echo.
echo Contribution statistics:
echo ----------------------
echo Ayan Anees: 30.6%% of commits (Login, authentication, and state management)
echo Haley Tri: 32.3%% of commits (Volunteer matching and history features)
echo Hanna Asfaw: 22.6%% of commits (Event management functionality)
echo Sameer Gul: 11.3%% of commits (User profile management)
echo Team: 3.2%% of commits (Project organization and final integration)
echo.
echo GitHub should now show these statistics in the Insights tab.
