#!/bin/bash

set -e  # exit on any error

if [[ -z "$@" ]]; then
  set -- -m "build: deploy"
  echo "No arguments supplied, using generic arguments '${@}'"
fi

# for elem in "${@}"
# do
#   echo $elem
# done

cd "$(git rev-parse --show-toplevel)"

git checkout main

npm run build

git checkout gh-pages

git rm -r .

mv dist/* .

git add .
git commit "${@}"
git push origin gh-pages

# remove new untracked objects?? (actl not untracked)
rm -r .vite/ 2>/dev/null || :

git checkout main

echo "Commited with arguments: ${@}"