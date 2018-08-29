#!/usr/bin/env bash

# Prerequisits:
# 1) AWS CLI installation (pip install awscli --upgrade --user)
# 2) AWS CLI Login ("aws configure" with default region eu-central-1)
# 3) aws configure set preview.cloudfront true
# 4) ask admin of aws for access to s3
# (unfortunaltely just adding a user to a specific bucket wouldn't work. after getting the correct ID (there are like 100 ids...) and trying to attach the permission, the user still wouldn't appear...)

if [ "${1}" == "dev" ]; then
  echo "no dev"
  exit 0
#   CDN_DISTRIBUTION_ID="E2LZW212SBZM97"
#   S3_DIST="s3://aws-website-taskbase-dev-q5ja3/"
elif [ "${1}" == "prod" ]; then
  echo "deploying to prod"
  CDN_DISTRIBUTION_ID="E23YPUTHB44TM0"
  S3_DIST="s3://cf-f7474b35-54b4-4f47-89ec-5129e8dc1419/"
else
  echo "Expected dev or prod as argument"
  exit 0
fi

npm run build:prod
aws s3 cp dist/retrace $S3_DIST --recursive
aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUTION_ID --paths "/*"
echo "Done!"

