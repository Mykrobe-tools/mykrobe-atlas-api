export CURRENT_VERSION=`cat /var/go/releases/CURRENT_VERSION`
export PREVIOUS_VERSION=`cat /var/go/releases/PREVIOUS_VERSION`

# remove unwanted containers
docker rm -f mend-api db || true
cd /var/go/releases/$CURRENT_VERSION/deploy

# run docker-compose up
subber docker-compose.yml
docker-compose up -d

# clean containers down
./dkcleanup.sh

# remove unused volumes
echo 'Start volumes cleanup'
docker volume ls -qf dangling=true | xargs -r docker volume rm
echo 'End volumes cleanup'

# generate the api doc
echo 'Start doc update'
docker exec -i mend-api script /dev/null -c 'apidoc -i src/server/'
echo 'End doc update'

# all ok set PREVIOUS_VERSION
echo $CURRENT_VERSION > /var/go/releases/PREVIOUS_VERSION
