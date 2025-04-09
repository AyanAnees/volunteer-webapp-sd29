#!/bin/sh

# Set the filter branch environment variable to suppress warnings
export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --env-filter '
# For all Hanna Dem commits with example.com email
if [ "$GIT_AUTHOR_NAME" = "Hanna Dem" ] || [ "$GIT_COMMITTER_NAME" = "Hanna Dem" ]; then
    # Always set both author and committer to Hanna with the correct GitHub email
    export GIT_AUTHOR_NAME="Hanna Asfaw"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
    export GIT_COMMITTER_NAME="Hanna Asfaw"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
fi

# Make sure consistent naming is used for all team members
# Standardize on GitHub username for better GitHub attribution

# Fix Haley commits to use consistent identity
if [ "$GIT_AUTHOR_NAME" = "Haley Trinh" ] || [ "$GIT_AUTHOR_NAME" = "Haley Tri" ]; then
    export GIT_AUTHOR_NAME="haleytri"
    export GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Haley Trinh" ] || [ "$GIT_COMMITTER_NAME" = "Haley Tri" ]; then
    export GIT_COMMITTER_NAME="haleytri"
    export GIT_COMMITTER_EMAIL="haleytrinh7@gmail.com"
fi

# Fix Hanna commits to use consistent identity
if [ "$GIT_AUTHOR_NAME" = "Hanna Asfaw" ]; then
    export GIT_AUTHOR_NAME="Hannadem12"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Hanna Asfaw" ]; then
    export GIT_COMMITTER_NAME="Hannadem12"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
fi

# Fix Sameer commits to use consistent identity
if [ "$GIT_AUTHOR_NAME" = "Sameer Gul" ]; then
    export GIT_AUTHOR_NAME="SameerGul123"
    export GIT_AUTHOR_EMAIL="sameergul6619@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Sameer Gul" ]; then
    export GIT_COMMITTER_NAME="SameerGul123"
    export GIT_COMMITTER_EMAIL="sameergul6619@gmail.com"
fi

# Fix Ayan commits to use consistent identity
if [ "$GIT_AUTHOR_NAME" = "Ayan Anees" ]; then
    export GIT_AUTHOR_NAME="AyanAnees"
    export GIT_AUTHOR_EMAIL="ayananees007@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Ayan Anees" ]; then
    export GIT_COMMITTER_NAME="AyanAnees"
    export GIT_COMMITTER_EMAIL="ayananees007@gmail.com"
fi

# Make sure author and committer match for all commits
if [ "$GIT_AUTHOR_NAME" != "$GIT_COMMITTER_NAME" ] || [ "$GIT_AUTHOR_EMAIL" != "$GIT_COMMITTER_EMAIL" ]; then
    # Set committer to match author
    export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
    export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"
fi
' --tag-name-filter cat -- --all
