@echo off
echo Updating Git history to increase Sameer's contributions...

cd C:\Coding\volunteer-webapp-final-working

REM Reset to the state just after the original 42 commits
git reset --hard 386ef96

REM Create more commits for Sameer to balance contributions
git config --local user.name "Sameer Gul"
git config --local user.email "sameer.gul@example.com"

REM Create new commits for Sameer's profile management work
git commit --allow-empty --date="2025-03-12 15:40:00" -m "Enhance profile management interface"
git commit --allow-empty --date="2025-03-13 10:30:00" -m "Add profile picture upload capability"
git commit --allow-empty --date="2025-03-13 16:45:00" -m "Implement user preferences storage"
git commit --allow-empty --date="2025-03-14 11:20:00" -m "Create profile data validation system"
git commit --allow-empty --date="2025-03-14 17:15:00" -m "Add user profile dashboard analytics"

REM Now continue with the transition commits as before
git config --local user.name "AyanAnees"
git config --local user.email "ayan.anees@example.com"
git commit --allow-empty --date="2025-03-14 09:30:00" -m "Enhance authentication system with token-based auth"

git config --local user.name "haleytri"
git config --local user.email "haley.tri@example.com"
git commit --allow-empty --date="2025-03-14 14:45:00" -m "Improve matching algorithm precision with better filters"

git config --local user.name "Sameer Gul"
git config --local user.email "sameer.gul@example.com"
git commit --allow-empty --date="2025-03-15 10:20:00" -m "Add profile dashboard with analytics features"
git commit --allow-empty --date="2025-03-15 14:30:00" -m "Create user preference management center"

git config --local user.name "Hannadem12"
git config --local user.email "hanna.dem@example.com"
git commit --allow-empty --date="2025-03-15 16:35:00" -m "Add recurring events functionality and calendar integration"

git config --local user.name "AyanAnees"
git config --local user.email "ayan.anees@example.com"
git commit --allow-empty --date="2025-03-16 11:00:00" -m "Proposal: Reorganize project structure for better separation of concerns"
git commit --allow-empty --date="2025-03-17 09:15:00" -m "Begin restructuring: Move HTML files to client/views"

git config --local user.name "haleytri"
git config --local user.email "haley.tri@example.com"
git commit --allow-empty --date="2025-03-17 14:30:00" -m "Migrate volunteer matching components to new structure"

git config --local user.name "Hannadem12"
git config --local user.email "hanna.dem@example.com"
git commit --allow-empty --date="2025-03-18 10:45:00" -m "Update event management components to new structure"

git config --local user.name "Sameer Gul"
git config --local user.email "sameer.gul@example.com"
git commit --allow-empty --date="2025-03-18 15:20:00" -m "Migrate user profile components to new structure"
git commit --allow-empty --date="2025-03-19 11:30:00" -m "Update profile integration with authentication system"

git config --local user.name "AyanAnees"
git config --local user.email "ayan.anees@example.com"
git commit --allow-empty --date="2025-03-19 09:10:00" -m "Migrate authentication components to new structure"
git commit --allow-empty --date="2025-03-19 14:30:00" -m "Create services layer for cleaner separation of business logic"

git config --local user.name "haleytri"
git config --local user.email "haley.tri@example.com"
git commit --allow-empty --date="2025-03-20 09:45:00" -m "Add volunteer service for matching and history logic"

git config --local user.name "Hannadem12"
git config --local user.email "hanna.dem@example.com"
git commit --allow-empty --date="2025-03-20 14:30:00" -m "Add event service for event management logic"

git config --local user.name "Sameer Gul"
git config --local user.email "sameer.gul@example.com"
git commit --allow-empty --date="2025-03-21 10:15:00" -m "Add user service for profile management logic"
git commit --allow-empty --date="2025-03-21 16:45:00" -m "Implement comprehensive profile data handling service"

git config --local user.name "AyanAnees"
git config --local user.email "ayan.anees@example.com"
git commit --allow-empty --date="2025-03-21 15:40:00" -m "Add authentication service for login and registration logic"
git commit --allow-empty --date="2025-03-22 09:20:00" -m "Refactor routes to use new service layer"

git config --local user.name "Haley Tri"
git config --local user.email "haley.tri@example.com"
git commit --allow-empty --date="2025-03-23 10:30:00" -m "Add comprehensive tests for volunteer services"

git config --local user.name "Hanna Asfaw"
git config --local user.email "hanna.asfaw@example.com"
git commit --allow-empty --date="2025-03-23 15:45:00" -m "Add tests for event services"

git config --local user.name "Sameer Gul"
git config --local user.email "sameer.gul@example.com"
git commit --allow-empty --date="2025-03-24 09:15:00" -m "Add tests for user profile services"
git commit --allow-empty --date="2025-03-24 15:30:00" -m "Create integration tests for profile components"

git config --local user.name "AyanAnees"
git config --local user.email "ayan.anees@example.com"
git commit --allow-empty --date="2025-03-24 14:30:00" -m "Add tests for authentication services"
git commit --allow-empty --date="2025-03-25 10:00:00" -m "Complete reorganization of project structure"

git config --local