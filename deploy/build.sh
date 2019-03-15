#/bin/bash
set -e

export CURRENT_VERSION=`cat /var/go/releases/server/CURRENT_VERSION`

cd /var/go/releases/server/$CURRENT_VERSION


# build the target container
subber deploy/docker-compose.yml

