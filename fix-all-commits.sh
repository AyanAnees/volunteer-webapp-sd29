#!/bin/sh

git filter-branch -f --env-filter '
OLD_EMAIL="team@example.com"

# Fix Haley commits
if [ "$GIT_COMMITTER_NAME" = "Haley Tri" ] || [ "$GIT_COMMITTER_NAME" = "haleytri" ] || [ "$GIT_AUTHOR_NAME" = "Haley Tri" ] || [ "$GIT_AUTHOR_NAME" = "haleytri" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "haleytri" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "Haley Tri" ]; then
    export GIT_COMMITTER_NAME="haleytri"
    export GIT_COMMITTER_EMAIL="haleytrinh7@gmail.com"
    export GIT_AUTHOR_NAME="haleytri"
    export GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"
fi

# Fix Hanna commits
if [ "$GIT_COMMITTER_NAME" = "Hanna Asfaw" ] || [ "$GIT_COMMITTER_NAME" = "Hannadem12" ] || [ "$GIT_AUTHOR_NAME" = "Hanna Asfaw" ] || [ "$GIT_AUTHOR_NAME" = "Hannadem12" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "Hannadem12" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "Hanna Asfaw" ]; then
    export GIT_COMMITTER_NAME="Hannadem12" 
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
    export GIT_AUTHOR_NAME="Hannadem12"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
fi

# Fix Sameer commits
if [ "$GIT_COMMITTER_NAME" = "Sameer Gul" ] || [ "$GIT_COMMITTER_NAME" = "SameerGul123" ] || [ "$GIT_AUTHOR_NAME" = "Sameer Gul" ] || [ "$GIT_AUTHOR_NAME" = "SameerGul123" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "Sameer Gul" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "SameerGul123" ]; then
    export GIT_COMMITTER_NAME="SameerGul123"
    export GIT_COMMITTER_EMAIL="sameergul6619@gmail.com"
    export GIT_AUTHOR_NAME="SameerGul123"
    export GIT_AUTHOR_EMAIL="sameergul6619@gmail.com"
fi

# Fix Ayan commits
if [ "$GIT_COMMITTER_NAME" = "AyanAnees" ] || [ "$GIT_AUTHOR_NAME" = "AyanAnees" ] || [ "$GIT_COMMITTER_NAME" = "Ayan Anees" ] || [ "$GIT_AUTHOR_NAME" = "Ayan Anees" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "AyanAnees" ] || [ "$GIT_COMMITTER_NAME" = "Team" -a "$GIT_AUTHOR_NAME" = "Ayan Anees" ]; then
    export GIT_COMMITTER_NAME="AyanAnees"
    export GIT_COMMITTER_EMAIL="ayananees007@gmail.com"
    export GIT_AUTHOR_NAME="AyanAnees"
    export GIT_AUTHOR_EMAIL="ayananees007@gmail.com"
fi

# If it is a "Team" commit with no known author, assign to one of the team members based on content
if [ "$GIT_COMMITTER_NAME" = "Team" ] || [ "$GIT_AUTHOR_NAME" = "Team" ]; then
    # Check commit message to assign it appropriately
    COMMIT_MSG=$(git log -1 --format=%B $GIT_COMMIT)
    
    if [[ $COMMIT_MSG == *"profile"* || $COMMIT_MSG == *"user"* || $COMMIT_MSG == *"Sameer"* ]]; then
        export GIT_COMMITTER_NAME="SameerGul123"
        export GIT_COMMITTER_EMAIL="sameergul6619@gmail.com"
        export GIT_AUTHOR_NAME="SameerGul123"
        export GIT_AUTHOR_EMAIL="sameergul6619@gmail.com"
    elif [[ $COMMIT_MSG == *"volunteer"* || $COMMIT_MSG == *"matching"* || $COMMIT_MSG == *"haley"* || $COMMIT_MSG == *"history"* ]]; then
        export GIT_COMMITTER_NAME="haleytri"
        export GIT_COMMITTER_EMAIL="haleytrinh7@gmail.com"
        export GIT_AUTHOR_NAME="haleytri"
        export GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"
    elif [[ $COMMIT_MSG == *"event"* || $COMMIT_MSG == *"hanna"* ]]; then
        export GIT_COMMITTER_NAME="Hannadem12" 
        export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
        export GIT_AUTHOR_NAME="Hannadem12"
        export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
    else
        # Default to Ayan for any other commit
        export GIT_COMMITTER_NAME="AyanAnees"
        export GIT_COMMITTER_EMAIL="ayananees007@gmail.com"
        export GIT_AUTHOR_NAME="AyanAnees"
        export GIT_AUTHOR_EMAIL="ayananees007@gmail.com"
    fi
fi
' --tag-name-filter cat -- --all
