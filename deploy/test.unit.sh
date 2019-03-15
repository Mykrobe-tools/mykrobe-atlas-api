#/bin/bash
set -e

export CURRENT_VERSION=`cat /var/go/releases/server/CURRENT_VERSION`
cd /var/go/releases/server/$CURRENT_VERSION

docker build -t atlas-api-test-unit -f deploy/Dockerfile.test.unit .
docker run --rm -v /home/ubuntu/binaries/mongo:/app/tmp/mongo -v /var/go/reports:/app/reports atlas-api-test-unit