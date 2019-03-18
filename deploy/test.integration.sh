#/bin/bash
set -e

cd /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api

mkdir reports

docker build -t atlas-api-test-integration -f deploy/Dockerfile.test.integration .
docker run --rm -v /home/ubuntu/binaries/mongo:/app/tmp/mongo -v /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api/reports:/app/reports atlas-api-test-integration