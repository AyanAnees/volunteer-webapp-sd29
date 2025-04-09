@echo off
echo Running direct Git commands to fix attribution issues...

REM Set environment variable to suppress filter-branch warnings
SET FILTER_BRANCH_SQUELCH_WARNING=1

REM Use git filter-branch with cmd-compatible syntax for fixing author/committer
git filter-branch -f --env-filter "^
if \"%GIT_AUTHOR_NAME%\" == \"Hanna Dem\" (^
  SET GIT_AUTHOR_NAME=Hannadem12^
  SET GIT_AUTHOR_EMAIL=hannadasfaw@gmail.com^
)^
if \"%GIT_COMMITTER_NAME%\" == \"Hanna Dem\" (^
  SET GIT_COMMITTER_NAME=Hannadem12^
  SET GIT_COMMITTER_EMAIL=hannadasfaw@gmail.com^
)^
if \"%GIT_AUTHOR_NAME%\" == \"Haley Trinh\" (^
  SET GIT_AUTHOR_NAME=haleytri^
  SET GIT_AUTHOR_EMAIL=haleytrinh7@gmail.com^
)^
if \"%GIT_COMMITTER_NAME%\" == \"Haley Trinh\" (^
  SET GIT_COMMITTER_NAME=haleytri^
  SET GIT_COMMITTER_EMAIL=haleytrinh7@gmail.com^
)^
if \"%GIT_AUTHOR_NAME%\" == \"Hanna Asfaw\" (^
  SET GIT_AUTHOR_NAME=Hannadem12^
  SET GIT_AUTHOR_EMAIL=hannadasfaw@gmail.com^
)^
if \"%GIT_COMMITTER_NAME%\" == \"Hanna Asfaw\" (^
  SET GIT_COMMITTER_NAME=Hannadem12^
  SET GIT_COMMITTER_EMAIL=hannadasfaw@gmail.com^
)^
if \"%GIT_AUTHOR_NAME%\" == \"Sameer Gul\" (^
  SET GIT_AUTHOR_NAME=SameerGul123^
  SET GIT_AUTHOR_EMAIL=sameergul6619@gmail.com^
)^
if \"%GIT_COMMITTER_NAME%\" == \"Sameer Gul\" (^
  SET GIT_COMMITTER_NAME=SameerGul123^
  SET GIT_COMMITTER_EMAIL=sameergul6619@gmail.com^
)^
if \"%GIT_AUTHOR_NAME%\" == \"Ayan Anees\" (^
  SET GIT_AUTHOR_NAME=AyanAnees^
  SET GIT_AUTHOR_EMAIL=ayananees007@gmail.com^
)^
if \"%GIT_COMMITTER_NAME%\" == \"Ayan Anees\" (^
  SET GIT_COMMITTER_NAME=AyanAnees^
  SET GIT_COMMITTER_EMAIL=ayananees007@gmail.com^
)^
if not \"%GIT_AUTHOR_NAME%\" == \"%GIT_COMMITTER_NAME%\" (^
  SET GIT_COMMITTER_NAME=%GIT_AUTHOR_NAME%^
  SET GIT_COMMITTER_EMAIL=%GIT_AUTHOR_EMAIL%^
)^
" --tag-name-filter cat -- --all

echo Done fixing attribution.
echo.
echo Current contributor stats:
git shortlog -sne --all

echo.
echo Process complete. Please check the attribution and push changes if satisfied.
