#/bin/bash
set -e

export CURRENT_VERSION=`cat /var/go/releases/server/CURRENT_VERSION`
cd /var/go/releases/server/$CURRENT_VERSION

docker build -t atlas-api-test-integration -f deploy/Dockerfile.test.integration .
docker run --rm -v /home/ubuntu/binaries/mongo:/app/tmp/mongo -v /var/go/reports:/app/reports atlas-api-test-integration