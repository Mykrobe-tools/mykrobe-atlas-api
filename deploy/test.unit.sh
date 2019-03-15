#/bin/bash
set -e

export CURRENT_VERSION=`date +"%Y%m%d%H%M"`

echo $CURRENT_VERSION > /var/go/releases/server/CURRENT_VERSION

mkdir -p /var/go/releases/server/$CURRENT_VERSION
cd /var/go/releases/server/$CURRENT_VERSION

cp -rf /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api/. .

docker build -t atlas-api-test-unit -f deploy/Dockerfile.test.unit .
docker run --rm -v /home/ubuntu/binaries/mongo:/app/tmp/mongo atlas-api-test-unit