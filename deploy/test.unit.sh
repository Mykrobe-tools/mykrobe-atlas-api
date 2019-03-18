#/bin/bash
set -e

cd /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api

docker build -t atlas-api-test-unit -f deploy/Dockerfile.test.unit .
docker run --rm -v /home/ubuntu/binaries/mongo:/app/tmp/mongo -v ./reports:/app/reports atlas-api-test-unit