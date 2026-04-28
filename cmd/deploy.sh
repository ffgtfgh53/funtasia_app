#!/bin/bash

set -e  # exit on any error

DEPLOY_COMMIT_MESSAGE=$1

if [ -z "$DEPLOY_COMMIT_MESSAGE" ]; then
  DEPLOY_COMMIT_MESSAGE="build: deploy"
  echo "No arguments supplied, using generic commit message '$DEPLOY_COMMIT_MESSAGE'"
fi

cd "$(git rev-parse --show-toplevel)"

git checkout main

npm run build

git checkout gh-pages

git rm -r .

mv dist/* .

git add .
git commit -m "$DEPLOY_COMMIT_MESSAGE"
git push origin gh-pages

# remove new untracked objects
rm -r .vite/

git checkout main

echo "Commited with message: $DEPLOY_COMMIT_MESSAGE"