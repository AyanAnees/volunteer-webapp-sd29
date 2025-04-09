#!/bin/sh

# Set the filter branch environment variable to suppress warnings
export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --env-filter '
# For all commits, check if they are from Hanna (under any name/email variation)
if [ "$GIT_AUTHOR_NAME" = "Hanna Asfaw" ] || [ "$GIT_AUTHOR_NAME" = "Hannadem12" ] || [ "$GIT_COMMITTER_NAME" = "Hanna Asfaw" ] || [ "$GIT_COMMITTER_NAME" = "Hannadem12" ]; then
    # Always set both author and committer to Hanna with the correct GitHub email
    export GIT_AUTHOR_NAME="Hanna Asfaw"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
    export GIT_COMMITTER_NAME="Hanna Asfaw"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
fi
' --tag-name-filter cat -- --all
