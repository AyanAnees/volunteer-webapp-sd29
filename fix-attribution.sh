#!/bin/bash

echo "Starting Git contribution attribution fix process..."

echo "Current contribution statistics:"
git shortlog -sne --all

# Set environment variable to suppress warnings
export FILTER_BRANCH_SQUELCH_WARNING=1

# Create mailmap with all standardized identities
cat > .mailmap <<EOL
haleytri <haleytrinh7@gmail.com> Haley Trinh <haleytrinh7@gmail.com>
haleytri <haleytrinh7@gmail.com> Haley Tri <haley.tri@example.com>
haleytri <haleytrinh7@gmail.com> haleytri <haley.tri@example.com>
haleytri <haleytrinh7@gmail.com> Haley Trinh <haley.trinh@gmail.com>
Hannadem12 <hannadasfaw@gmail.com> Hanna Asfaw <hannadasfaw@gmail.com>
Hannadem12 <hannadasfaw@gmail.com> Hanna Dem <hannadem12@example.com>
Hannadem12 <hannadasfaw@gmail.com> Hanna Asfaw <hanna.asfaw@example.com>
Hannadem12 <hannadasfaw@gmail.com> Hannadem12 <hanna.dem@example.com>
SameerGul123 <sameergul6619@gmail.com> Sameer Gul <sameergul6619@gmail.com>
SameerGul123 <sameergul6619@gmail.com> Sameer Gul <sameer.gul@example.com>
SameerGul123 <sameergul6619@gmail.com> SameerGul123 <sameer.gul@example.com>
AyanAnees <ayananees007@gmail.com> Ayan Anees <ayananees007@gmail.com>
AyanAnees <ayananees007@gmail.com> AyanAnees <ayan.anees@example.com>
EOL

# Create environment filter script
cat > fix_env.sh <<EOL
#!/bin/bash

# Fix Hanna's commits with example.com email
if [[ "\$GIT_AUTHOR_NAME" == "Hanna Dem" || "\$GIT_COMMITTER_NAME" == "Hanna Dem" ]]; then
    export GIT_AUTHOR_NAME="Hannadem12"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
    export GIT_COMMITTER_NAME="Hannadem12"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
fi

# Fix Haley commits to use consistent identity
if [[ "\$GIT_AUTHOR_NAME" == "Haley Trinh" || "\$GIT_AUTHOR_NAME" == "Haley Tri" ]]; then
    export GIT_AUTHOR_NAME="haleytri"
    export GIT_AUTHOR_EMAIL="haleytrinh7@gmail.com"
fi
if [[ "\$GIT_COMMITTER_NAME" == "Haley Trinh" || "\$GIT_COMMITTER_NAME" == "Haley Tri" ]]; then
    export GIT_COMMITTER_NAME="haleytri"
    export GIT_COMMITTER_EMAIL="haleytrinh7@gmail.com"
fi

# Fix Hanna commits to use consistent identity
if [[ "\$GIT_AUTHOR_NAME" == "Hanna Asfaw" ]]; then
    export GIT_AUTHOR_NAME="Hannadem12"
    export GIT_AUTHOR_EMAIL="hannadasfaw@gmail.com"
fi
if [[ "\$GIT_COMMITTER_NAME" == "Hanna Asfaw" ]]; then
    export GIT_COMMITTER_NAME="Hannadem12"
    export GIT_COMMITTER_EMAIL="hannadasfaw@gmail.com"
fi

# Fix Sameer commits to use consistent identity
if [[ "\$GIT_AUTHOR_NAME" == "Sameer Gul" ]]; then
    export GIT_AUTHOR_NAME="SameerGul123"
    export GIT_AUTHOR_EMAIL="sameergul6619@gmail.com"
fi
if [[ "\$GIT_COMMITTER_NAME" == "Sameer Gul" ]]; then
    export GIT_COMMITTER_NAME="SameerGul123"
    export GIT_COMMITTER_EMAIL="sameergul6619@gmail.com"
fi

# Fix Ayan commits to use consistent identity
if [[ "\$GIT_AUTHOR_NAME" == "Ayan Anees" ]]; then
    export GIT_AUTHOR_NAME="AyanAnees"
    export GIT_AUTHOR_EMAIL="ayananees007@gmail.com"
fi
if [[ "\$GIT_COMMITTER_NAME" == "Ayan Anees" ]]; then
    export GIT_COMMITTER_NAME="AyanAnees"
    export GIT_COMMITTER_EMAIL="ayananees007@gmail.com"
fi

# Make sure author and committer match for all commits
if [[ "\$GIT_AUTHOR_NAME" != "\$GIT_COMMITTER_NAME" || "\$GIT_AUTHOR_EMAIL" != "\$GIT_COMMITTER_EMAIL" ]]; then
    export GIT_COMMITTER_NAME="\$GIT_AUTHOR_NAME"
    export GIT_COMMITTER_EMAIL="\$GIT_AUTHOR_EMAIL"
fi
EOL

chmod +x fix_env.sh

echo "Running git filter-branch to fix all attribution issues at once..."
git filter-branch -f --env-filter ". ./fix_env.sh" --tag-name-filter cat -- --all

echo "Final contribution statistics:"
git shortlog -sne --all

# Clean up temporary files
rm fix_env.sh

echo "Git contribution attribution fix completed!"
echo "Next steps:"
echo "1. Push changes to GitHub: git push origin --force"
echo "2. Verify contribution statistics on GitHub"
