#!/bin/zsh

git stash
git submodule update --remote
if [[ `git status --porcelain` ]]; then
  yarn dungeons || exit
  git add -A
  git commit -m "mdt update"
  git push
fi
git stash pop