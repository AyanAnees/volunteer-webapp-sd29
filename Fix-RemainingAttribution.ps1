# PowerShell script to fix remaining attribution issues using git filter-repo
# Requires git-filter-repo to be installed
# Install with: pip install git-filter-repo

# Check if git-filter-repo is installed
try {
    $null = git filter-repo --version
} catch {
    Write-Error "git-filter-repo not found. Please install it with: pip install git-filter-repo"
    exit 1
}

# Set working directory
Set-Location -Path "C:\Coding\volunteer-webapp-final-working"

Write-Host "Starting the git attribution fix process..." -ForegroundColor Green

# Create a mailmap file with the correct mappings
$mailmapContent = @"
haleytri <haleytrinh7@gmail.com> Haley Trinh <haleytrinh7@gmail.com>
haleytri <haleytrinh7@gmail.com> Haley Tri <haley.tri@example.com>
haleytri <haleytrinh7@gmail.com> haleytri <haley.tri@example.com>
Hannadem12 <hannadasfaw@gmail.com> Hanna Asfaw <hannadasfaw@gmail.com>
Hannadem12 <hannadasfaw@gmail.com> Hanna Dem <hannadem12@example.com>
Hannadem12 <hannadasfaw@gmail.com> Hanna Asfaw <hanna.asfaw@example.com>
Hannadem12 <hannadasfaw@gmail.com> Hannadem12 <hanna.dem@example.com>
SameerGul123 <sameergul6619@gmail.com> Sameer Gul <sameergul6619@gmail.com>
SameerGul123 <sameergul6619@gmail.com> Sameer Gul <sameer.gul@example.com>
SameerGul123 <sameergul6619@gmail.com> SameerGul123 <sameer.gul@example.com>
AyanAnees <ayananees007@gmail.com> Ayan Anees <ayananees007@gmail.com>
AyanAnees <ayananees007@gmail.com> AyanAnees <ayan.anees@example.com>
"@

# Update the mailmap file
$mailmapContent | Out-File -FilePath ".mailmap" -Encoding utf8 -Force

Write-Host "Created .mailmap file with correct mappings" -ForegroundColor Green

# Create a simple script to standardize author/committer identities
$scriptContent = @"
#!/usr/bin/env python3
import sys
import re
from datetime import datetime, timezone

# These will be populated by filter-repo
author_name = sys.argv[1]
author_email = sys.argv[2]
committer_name = sys.argv[3]
committer_email = sys.argv[4]

# Standardize Haley's identity
if 'haley' in author_name.lower() or 'haley' in author_email.lower():
    author_name = 'haleytri'
    author_email = 'haleytrinh7@gmail.com'
    
if 'haley' in committer_name.lower() or 'haley' in committer_email.lower():
    committer_name = 'haleytri'
    committer_email = 'haleytrinh7@gmail.com'

# Standardize Hanna's identity
if 'hanna' in author_name.lower() or 'hanna' in author_email.lower():
    author_name = 'Hannadem12'
    author_email = 'hannadasfaw@gmail.com'
    
if 'hanna' in committer_name.lower() or 'hanna' in committer_email.lower():
    committer_name = 'Hannadem12'
    committer_email = 'hannadasfaw@gmail.com'

# Standardize Sameer's identity
if 'sameer' in author_name.lower() or 'sameer' in author_email.lower():
    author_name = 'SameerGul123'
    author_email = 'sameergul6619@gmail.com'
    
if 'sameer' in committer_name.lower() or 'sameer' in committer_email.lower():
    committer_name = 'SameerGul123'
    committer_email = 'sameergul6619@gmail.com'

# Standardize Ayan's identity
if 'ayan' in author_name.lower() or 'ayan' in author_email.lower():
    author_name = 'AyanAnees'
    author_email = 'ayananees007@gmail.com'
    
if 'ayan' in committer_name.lower() or 'ayan' in committer_email.lower():
    committer_name = 'AyanAnees'
    committer_email = 'ayananees007@gmail.com'

# Handle Team user
if 'team' in author_name.lower() or 'team' in author_email.lower():
    # Default to Ayan for Team commits
    author_name = 'AyanAnees'
    author_email = 'ayananees007@gmail.com'
    
if 'team' in committer_name.lower() or 'team' in committer_email.lower():
    committer_name = 'AyanAnees'
    committer_email = 'ayananees007@gmail.com'

# Make sure committer matches author
committer_name = author_name
committer_email = author_email

# Return the new values
print(f"{author_name}")
print(f"{author_email}")
print(f"{committer_name}")
print(f"{committer_email}")
"@

# Save the script
$scriptContent | Out-File -FilePath "fix_identities.py" -Encoding utf8 -Force

Write-Host "Created fix_identities.py script" -ForegroundColor Green

# Backup the repository before making changes
Write-Host "Creating backup of repository..." -ForegroundColor Yellow
Copy-Item -Path ".git" -Destination ".git.bak" -Recurse -Force

# Run git filter-repo to update all commits
Write-Host "Running git filter-repo to fix attribution issues..." -ForegroundColor Yellow
git filter-repo --mailmap .mailmap --name-callback "python fix_identities.py {name} {email} {committer-name} {committer-email}"

# Check if the operation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully fixed attribution issues!" -ForegroundColor Green
    
    # Check the updated contributions
    Write-Host "`nUpdated contribution statistics:" -ForegroundColor Cyan
    git shortlog -sne --all
    
    # Ask if the user wants to push to GitHub
    $pushChoice = Read-Host "`nWould you like to push changes to GitHub now? (Y/N)"
    
    if ($pushChoice -eq "Y" -or $pushChoice -eq "y") {
        Write-Host "Force pushing changes to GitHub (this may take a while)..." -ForegroundColor Yellow
        git push -f origin main
        Write-Host "Process complete. GitHub metrics should now show proper team contributions." -ForegroundColor Green
        Write-Host "You may need to wait a few minutes for GitHub to update the contribution graphs." -ForegroundColor Green
    } else {
        Write-Host "Changes have been applied locally but not pushed to GitHub." -ForegroundColor Yellow
    }
} else {
    Write-Host "Error fixing attribution issues. Restoring backup..." -ForegroundColor Red
    Remove-Item -Path ".git" -Recurse -Force
    Rename-Item -Path ".git.bak" -NewName ".git"
    Write-Host "Backup restored. Please try again or fix manually." -ForegroundColor Yellow
}

# Clean up temporary files
Remove-Item -Path "fix_identities.py" -Force
Write-Host "`nScript execution complete. Press any key to exit."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
