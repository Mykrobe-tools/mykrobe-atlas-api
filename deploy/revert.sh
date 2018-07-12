# remove the failed deployment directory
CURRENT_VERSION=$(cat /var/go/releases/server/CURRENT_VERSION)
rm -R /var/go/releases/server/$CURRENT_VERSION

# remove the failed image
docker images | grep $CURRENT_VERSION | awk '{print $1}' | xargs docker rmi

# work with the prior working version
PREVIOUS_VERSION=$(cat /var/go/releases/server/PREVIOUS_VERSION)
cd /var/go/releases/server/$PREVIOUS_VERSION/deploy

# remove current images
docker rm -f atlas-api db swagger-ui || true
docker images -q --filter "dangling=true" | xargs --no-run-if-empty docker rmi

# build the target container
docker-compose build

# remove unwanted containers
docker ps -a -q | xargs --no-run-if-empty docker rm -f	

# run docker-compose up
docker-compose up -d

# clean containers down
./dkcleanup.sh
