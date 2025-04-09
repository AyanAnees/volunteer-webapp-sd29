#!/bin/sh

git filter-branch --env-filter '
if [ "$GIT_COMMITTER_NAME" = "Haley Tri" ] || [ "$GIT_COMMITTER_NAME" = "haleytri" ]; then
    export GIT_COMMITTER_NAME="Haley Trinh"
    export GIT_COMMITTER_EMAIL="haleytri@users.noreply.github.com"
    export GIT_AUTHOR_NAME="Haley Trinh"
    export GIT_AUTHOR_EMAIL="haleytri@users.noreply.github.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Hanna Asfaw" ] || [ "$GIT_COMMITTER_NAME" = "Hannadem12" ]; then
    export GIT_COMMITTER_NAME="Hanna Asfaw"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
    export GIT_AUTHOR_NAME="Hanna Asfaw"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Sameer Gul" ] || [ "$GIT_COMMITTER_NAME" = "SameerGul123" ]; then
    export GIT_COMMITTER_NAME="Sameer Gul"
    export GIT_COMMITTER_EMAIL="SameerGul123@users.noreply.github.com"
    export GIT_AUTHOR_NAME="Sameer Gul"
    export GIT_AUTHOR_EMAIL="SameerGul123@users.noreply.github.com"
fi
' --tag-name-filter cat -- --branches --tags
