#!/bin/sh

git filter-branch -f --env-filter '

# Get current author and committer info
CURRENT_AUTHOR_NAME="$GIT_AUTHOR_NAME"
CURRENT_AUTHOR_EMAIL="$GIT_AUTHOR_EMAIL"
CURRENT_COMMITTER_NAME="$GIT_COMMITTER_NAME"
CURRENT_COMMITTER_EMAIL="$GIT_COMMITTER_EMAIL"

# Check for Team user and replace with the appropriate user
if [ "$CURRENT_AUTHOR_NAME" = "Team" ] || [ "$CURRENT_COMMITTER_NAME" = "Team" ]; then
    # If one of them is Team, use the other one if it is not Team
    if [ "$CURRENT_AUTHOR_NAME" != "Team" ]; then
        NEW_NAME="$CURRENT_AUTHOR_NAME"
        NEW_EMAIL="$CURRENT_AUTHOR_EMAIL"
    elif [ "$CURRENT_COMMITTER_NAME" != "Team" ]; then
        NEW_NAME="$CURRENT_COMMITTER_NAME"
        NEW_EMAIL="$CURRENT_COMMITTER_EMAIL"
    else
        # If both are Team, default to Ayan as repo owner
        NEW_NAME="Ayan Anees"
        NEW_EMAIL="ayananees007@gmail.com"
    fi
    
    # Set both author and committer to the same person
    export GIT_AUTHOR_NAME="$NEW_NAME"
    export GIT_AUTHOR_EMAIL="$NEW_EMAIL"
    export GIT_COMMITTER_NAME="$NEW_NAME"
    export GIT_COMMITTER_EMAIL="$NEW_EMAIL"
elif [ "$CURRENT_AUTHOR_NAME" != "$CURRENT_COMMITTER_NAME" ] || [ "$CURRENT_AUTHOR_EMAIL" != "$CURRENT_COMMITTER_EMAIL" ]; then
    # If author and committer are different (but neither is Team), set committer to match author
    export GIT_COMMITTER_NAME="$CURRENT_AUTHOR_NAME"
    export GIT_COMMITTER_EMAIL="$CURRENT_AUTHOR_EMAIL"
fi

# Additional checks for specific users to ensure proper emails
if [ "$GIT_AUTHOR_NAME" = "Haley Trinh" ] || [ "$GIT_AUTHOR_NAME" = "haleytri" ]; then
    export GIT_AUTHOR_NAME="Haley Trinh"
    export GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"