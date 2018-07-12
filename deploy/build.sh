#/bin/bash
set -e

export CURRENT_VERSION=`date +"%Y%m%d%H%M"`

echo $CURRENT_VERSION > /var/go/releases/server/CURRENT_VERSION

mkdir -p /var/go/releases/server/$CURRENT_VERSION
cd /var/go/releases/server/$CURRENT_VERSION

cp -rf /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api/. .

# copy the ssh key
cp /var/go/.ssh/bitbucket-readonly .

# build the target container
subber deploy/docker-compose.yml
docker-compose -f deploy/docker-compose.yml build

# build is done remove the ssh key
rm bitbucket-readonly
