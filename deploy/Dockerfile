FROM node:12.13.0
LABEL MAINTAINER="Yassire Elhani <yassire@makeandship.com>"

# install global packages
RUN yarn global add forever

# server installation directory
RUN mkdir /app

# push this app to the deployment directory
WORKDIR /app
ADD . /app

# trim to production dependencies post build
RUN cp -rf /app/node_modules/makeandship-api-common /tmp
RUN rm -rf /app/node_modules
RUN cd /app && yarn --ignore-scripts --production
RUN cp -rf /tmp/makeandship-api-common /app/node_modules

# run local api on 3000
EXPOSE 3000

# run up the server
CMD NODE_ENV=$NODE_ENV forever -l forever.log -o out.log -e err.log /app/dist/index.js
