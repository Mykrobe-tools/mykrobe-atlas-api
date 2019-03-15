#/bin/bash
set -e

export CURRENT_VERSION=`cat /var/go/releases/server/CURRENT_VERSION`

cd /var/go/releases/server/$CURRENT_VERSION


# build the target container
# build the image
cd /var/go/releases/$CURRENT_VERSION/deploy
envsubst < docker-compose.yml > docker-compose.yml.replace
mv docker-compose.yml.replace docker-compose.yml


