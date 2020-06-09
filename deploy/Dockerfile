FROM ubuntu:18.04
LABEL MAINTAINER="Yassire Elhani <yassire@makeandship.com>"

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV NODE_VERSION 12.13.0
ENV NVM_DIR /usr/local/nvm

# install required software before using nvm/node/npm/bower
RUN apt update
RUN apt install -y curl
RUN apt install -y git
RUN apt install -y python
RUN apt install -y build-essential
RUN apt install -y imagemagick
RUN apt install -y libssl-dev
RUN apt install -y apt-transport-https

# download and install nvm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

# install yarn
RUN npm install -g yarn

# install global packages
RUN yarn global add forever

# server installation directory
RUN mkdir /app

# push this app to the deployment directory
WORKDIR /app
ADD . /app

# install dependencies as a cachable step
RUN cd /app && \
    yarn

RUN ls -ltr
RUN cat package.json

# build and compile the source
RUN cd /app && \
    yarn build

# trim to production dependencies post build
RUN cp -rf /app/node_modules/makeandship-api-common /tmp
RUN rm -rf /app/node_modules
RUN cd /app && yarn --ignore-scripts --production
RUN cp -rf /tmp/makeandship-api-common /app/node_modules

# run local api on 3000
EXPOSE 3000

# run up the server
CMD NODE_ENV=$NODE_ENV forever -l forever.log -o out.log -e err.log /app/dist/index.js
