#/bin/bash
set -e

export CURRENT_VERSION=`date +"%Y%m%d%H%M"`

echo $CURRENT_VERSION > /var/go/releases/server/CURRENT_VERSION

mkdir -p /var/go/releases/server/$CURRENT_VERSION
cd /var/go/releases/server/$CURRENT_VERSION

cp -rf /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api/. .

# copy the ssh keys
cp /var/go/.ssh/bitbucket-readonly .
cp /var/go/.ssh/atlas-jsonschema-readonly .

# build the image
envsubst < deploy/docker-compose.yml > deploy/docker-compose.yml.replace
mv deploy/docker-compose.yml.replace deploy/docker-compose.yml
docker-compose -f deploy/docker-compose.yml build

# push to the registry
docker tag deploy-atlas-api mthomsit/atlas-api:latest
docker push mthomsit/atlas-api:latest

# build is done remove the ssh keys
rm bitbucket-readonly
rm atlas-jsonschema-readonly

