# remove unwanted containers and images
docker rm -f atlas-api db swagger-ui || true
docker images -q --filter "dangling=true" | xargs --no-run-if-empty docker rmi

cd /var/lib/go-agent/pipelines/${TARGET_ENVIRONMENT}-atlas-api/deploy

# replace env variables
envsubst < deploy/docker-compose.yml > deploy/docker-compose.yml.replace
mv deploy/docker-compose.yml.replace deploy/docker-compose.yml

# run docker-compose up
docker-compose up -d

# clean containers down
./dkcleanup.sh

# remove unused volumes
echo 'Start volumes cleanup'
docker volume ls -qf dangling=true | xargs -r docker volume rm
echo 'End volumes cleanup'
