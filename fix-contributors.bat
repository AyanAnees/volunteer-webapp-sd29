@echo off
echo Starting Git contribution attribution fix process...

echo Current contribution statistics:
git shortlog -sne --all

REM Set environment variable to suppress warnings
set FILTER_BRANCH_SQUELCH_WARNING=1

echo.
echo Step 1: Fixing Hanna's contributions...
git filter-branch -f --env-filter "
if [ \"%%GIT_AUTHOR_NAME%%\" = \"Hanna Dem\" ]; then
    export GIT_AUTHOR_NAME=\"Hannadem12\"
    export GIT_AUTHOR_EMAIL=\"hannadasfaw@gmail.com\"
fi
if [ \"%%GIT_COMMITTER_NAME%%\" = \"Hanna Dem\" ]; then
    export GIT_COMMITTER_NAME=\"Hannadem12\"
    export GIT_COMMITTER_EMAIL=\"hannadasfaw@gmail.com\"
fi
" --tag-name-filter cat -- --all

echo.
echo Step 2: Standardizing Haley's contributions...
git filter-branch -f --env-filter "
if [ \"%%GIT_AUTHOR_NAME%%\" = \"Haley Trinh\" ] || [ \"%%GIT_AUTHOR_NAME%%\" = \"Haley Tri\" ]; then
    export GIT_AUTHOR_NAME=\"haleytri\"
    export GIT_AUTHOR_EMAIL=\"haleytrinh7@gmail.com\"
fi
if [ \"%%GIT_COMMITTER_NAME%%\" = \"Haley Trinh\" ] || [ \"%%GIT_COMMITTER_NAME%%\" = \"Haley Tri\" ]; then
    export GIT_COMMITTER_NAME=\"haleytri\"
    export GIT_COMMITTER_EMAIL=\"haleytrinh7@gmail.com\"
fi
" --tag-name-filter cat -- --all

echo.
echo Step 3: Standardizing Hanna's contributions...
git filter-branch -f --env-filter "
if [ \"%%GIT_AUTHOR_NAME%%\" = \"Hanna Asfaw\" ]; then
    export GIT_AUTHOR_NAME=\"Hannadem12\"
    export GIT_AUTHOR_EMAIL=\"hannadasfaw@gmail.com\"
fi
if [ \"%%GIT_COMMITTER_NAME%%\" = \"Hanna Asfaw\" ]; then
    export GIT_COMMITTER_NAME=\"Hannadem12\"
    export GIT_COMMITTER_EMAIL=\"hannadasfaw@gmail.com\"
fi
" --tag-name-filter cat -- --all

echo.
echo Step 4: Standardizing Sameer's contributions...
git filter-branch -f --env-filter "
if [ \"%%GIT_AUTHOR_NAME%%\" = \"Sameer Gul\" ]; then
    export GIT_AUTHOR_NAME=\"SameerGul123\"
    export GIT_AUTHOR_EMAIL=\"sameergul6619@gmail.com\"
fi
if [ \"%%GIT_COMMITTER_NAME%%\" = \"Sameer Gul\" ]; then
    export GIT_COMMITTER_NAME=\"SameerGul123\"
    export GIT_COMMITTER_EMAIL=\"sameergul6619@gmail.com\"
fi
" --tag-name-filter cat -- --all

echo.
echo Step 5: Standardizing Ayan's contributions...
git filter-branch -f --env-filter "
if [ \"%%GIT_AUTHOR_NAME%%\" = \"Ayan Anees\" ]; then
    export GIT_AUTHOR_NAME=\"AyanAnees\"
    export GIT_AUTHOR_EMAIL=\"ayananees007@gmail.com\"
fi
if [ \"%%GIT_COMMITTER_NAME%%\" = \"Ayan Anees\" ]; then
    export GIT_COMMITTER_NAME=\"AyanAnees\"
    export GIT_COMMITTER_EMAIL=\"ayananees007@gmail.com\"
fi
" --tag-name-filter cat -- --all

echo.
echo Step 6: Matching author and committer for all commits...
git filter-branch -f --env-filter "
if [ \"%%GIT_AUTHOR_NAME%%\" != \"%%GIT_COMMITTER_NAME%%\" ] || [ \"%%GIT_AUTHOR_EMAIL%%\" != \"%%GIT_COMMITTER_EMAIL%%\" ]; then
    export GIT_COMMITTER_NAME=\"%%GIT_AUTHOR_NAME%%\"
    export GIT_COMMITTER_EMAIL=\"%%GIT_AUTHOR_EMAIL%%\"
fi
" --tag-name-filter cat -- --all

echo.
echo Final contribution statistics:
git shortlog -sne --all

echo.
echo Git contribution attribution fix completed!
echo Next steps:
echo 1. Push changes to GitHub: git push origin --force
echo 2. Verify contribution statistics on GitHub

pause
