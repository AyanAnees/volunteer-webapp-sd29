# PowerShell script to fix remaining attribution issues in Git repository

# Function to display current contribution statistics
function Show-GitStats {
    Write-Host "`nCurrent contribution statistics:" -ForegroundColor Cyan
    git shortlog -sne --all
}

Write-Host "Starting Git contribution attribution fix process..." -ForegroundColor Green
Write-Host "Current repository state:" -ForegroundColor Cyan
Show-GitStats

# Fix Hanna's commits with example.com email
Write-Host "`nFixing Hanna's commits with example.com email..." -ForegroundColor Yellow
git filter-branch -f --env-filter '
    if ($env:GIT_AUTHOR_NAME -eq "Hanna Dem" -or $env:GIT_COMMITTER_NAME -eq "Hanna Dem") {
        $env:GIT_AUTHOR_NAME="Hannadem12"
        $env:GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
        $env:GIT_COMMITTER_NAME="Hannadem12"
        $env:GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
    }
' --tag-name-filter cat -- --all

# Standardize on GitHub usernames for all contributors
Write-Host "`nStandardizing on GitHub usernames for all contributors..." -ForegroundColor Yellow
git filter-branch -f --env-filter '
    # Fix Haley commits
    if ($env:GIT_AUTHOR_NAME -eq "Haley Trinh" -or $env:GIT_AUTHOR_NAME -eq "Haley Tri") {
        $env:GIT_AUTHOR_NAME="haleytri"
        $env:GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"
    }
    if ($env:GIT_COMMITTER_NAME -eq "Haley Trinh" -or $env:GIT_COMMITTER_NAME -eq "Haley Tri") {
        $env:GIT_COMMITTER_NAME="haleytri"
        $env:GIT_COMMITTER_EMAIL="haleytrinh7@gmail.com"
    }
    
    # Fix Hanna commits
    if ($env:GIT_AUTHOR_NAME -eq "Hanna Asfaw") {
        $env:GIT_AUTHOR_NAME="Hannadem12"
        $env:GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
    }
    if ($env:GIT_COMMITTER_NAME -eq "Hanna Asfaw") {
        $env:GIT_COMMITTER_NAME="Hannadem12"
        $env:GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
    }
    
    # Fix Sameer commits
    if ($env:GIT_AUTHOR_NAME -eq "Sameer Gul") {
        $env:GIT_AUTHOR_NAME="SameerGul123"
        $env:GIT_AUTHOR_EMAIL="sameergul6619@gmail.com"
    }
    if ($env:GIT_COMMITTER_NAME -eq "Sameer Gul") {
        $env:GIT_COMMITTER_NAME="SameerGul123"
        $env:GIT_COMMITTER_EMAIL="sameergul6619@gmail.com"
    }
    
    # Fix Ayan commits
    if ($env:GIT_AUTHOR_NAME -eq "Ayan Anees") {
        $env:GIT_AUTHOR_NAME="AyanAnees"
        $env:GIT_AUTHOR_EMAIL="ayananees007@gmail.com"
    }
    if ($env:GIT_COMMITTER_NAME -eq "Ayan Anees") {
        $env:GIT_COMMITTER_NAME="AyanAnees"
        $env:GIT_COMMITTER_EMAIL="ayananees007@gmail.com"
    }
    
    # Make sure author and committer match
    if ($env:GIT_AUTHOR_NAME -ne $env:GIT_COMMITTER_NAME -or $env:GIT_AUTHOR_EMAIL -ne $env:GIT_COMMITTER_EMAIL) {
        $env:GIT_COMMITTER_NAME=$env:GIT_AUTHOR_NAME
        $env:GIT_COMMITTER_EMAIL=$env:GIT_AUTHOR_EMAIL
    }
' --tag-name-filter cat -- --all

Write-Host "`nVerifying attribution changes..." -ForegroundColor Green
Show-GitStats

Write-Host "`nGit contribution attribution fix completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push changes to GitHub: git push origin --force" -ForegroundColor White
Write-Host "2. Verify contribution statistics on GitHub" -ForegroundColor White
