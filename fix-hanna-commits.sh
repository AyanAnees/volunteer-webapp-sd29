#!/bin/sh

git filter-branch -f --env-filter '
# Check for all variations of Hannas name
if [ "$GIT_AUTHOR_NAME" = "Hanna Asfaw" ] || [ "$GIT_AUTHOR_NAME" = "Hannadem12" ] || [ "$GIT_COMMITTER_NAME" = "Hanna Asfaw" ] || [ "$GIT_COMMITTER_NAME" = "Hannadem12" ]; then
    # Ensure the email is exactly the one registered with GitHub
    export GIT_AUTHOR_NAME="Hanna Asfaw"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
    export GIT_COMMITTER_NAME="Hanna Asfaw" 
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
fi
' --tag-name-filter cat -- --all
