export CURRENT_VERSION=`cat /var/go/releases/server/CURRENT_VERSION`
export PREVIOUS_VERSION=`cat /var/go/releases/server/PREVIOUS_VERSION`

# remove unwanted containers and images
docker rm -f atlas-api db swagger-ui || true
docker images -q --filter "dangling=true" | xargs --no-run-if-empty docker rmi

cd /var/go/releases/server/$CURRENT_VERSION/deploy

# run docker-compose up
subber docker-compose.yml
docker-compose up -d

# clean containers down
./dkcleanup.sh

# remove unused volumes
echo 'Start volumes cleanup'
docker volume ls -qf dangling=true | xargs -r docker volume rm
echo 'End volumes cleanup'

# all ok set PREVIOUS_VERSION
echo $CURRENT_VERSION > /var/go/releases/server/PREVIOUS_VERSION
