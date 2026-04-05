#!/bin/bash

VERSION=$1

# update version
npm version $VERSION

# build
npm run build

# commit changes
git add .
git commit -m "update"

# tag version
git tag v1.3.0
git push origin main
git push origin v1.3.0

# build
npm run build

# deploy
git checkout gh-pages
rm -rf *
cp -r dist/* .
git add .
git commit -m "deploy v1.3.0"
git push
git checkout main