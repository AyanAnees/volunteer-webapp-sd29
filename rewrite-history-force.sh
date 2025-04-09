#!/bin/sh

git filter-branch -f --env-filter '
if [ "$GIT_COMMITTER_NAME" = "Haley Tri" ] || [ "$GIT_COMMITTER_NAME" = "haleytri" ]; then
    export GIT_COMMITTER_NAME="Haley Trinh"
    export GIT_COMMITTER_EMAIL="haleytrinh7@gmail.com"
    export GIT_AUTHOR_NAME="Haley Trinh"
    export GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Hanna Asfaw" ] || [ "$GIT_COMMITTER_NAME" = "Hannadem12" ]; then
    export GIT_COMMITTER_NAME="Hanna Asfaw"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
    export GIT_AUTHOR_NAME="Hanna Asfaw"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Sameer Gul" ] || [ "$GIT_COMMITTER_NAME" = "SameerGul123" ]; then
    export GIT_COMMITTER_NAME="Sameer Gul"
    export GIT_COMMITTER_EMAIL="sameergul6619@gmail.com"
    export GIT_AUTHOR_NAME="Sameer Gul"
    export GIT_AUTHOR_EMAIL="sameergul6619@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "AyanAnees" ]; then
    export GIT_COMMITTER_NAME="Ayan Anees"
    export GIT_COMMITTER_EMAIL="ayananees007@gmail.com"
    export GIT_AUTHOR_NAME="Ayan Anees"
    export GIT_AUTHOR_EMAIL="ayananees007@gmail.com"
fi
' --tag-name-filter cat -- --all
