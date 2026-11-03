#!/bin/bash
# CINEMIND — GitHub Push Utility
# Usage:
#   1. Using personal access token:
#      ./push-to-github.sh ghp_yourPersonalAccessTokenHere
#   2. Standard push (if git credential helper is already configured):
#      git push origin main

set -e

TOKEN=$1
REPO_URL="github.com/iam-ajmunna/CINEMIND-.git"

if [ -n "$TOKEN" ]; then
  echo "Pushing to https://$REPO_URL using provided access token..."
  git push https://iam-ajmunna:$TOKEN@$REPO_URL main
  echo "✓ Successfully pushed to https://github.com/iam-ajmunna/CINEMIND-.git"
else
  echo "No token passed as argument. Attempting standard git push origin main..."
  git push origin main
fi
