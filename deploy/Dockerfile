FROM ubuntu:18.04
LABEL MAINTAINER="Yassire Elhani <yassire@makeandship.com>"

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV NODE_VERSION 8.12.0
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

# Add the keys and set permissions
RUN mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh && \
    echo "IdentityFile /root/.ssh/bitbucket-readonly" >> /root/.ssh/config

ADD bitbucket-readonly /root/.ssh/
ADD atlas-jsonschema-readonly /root/.ssh/

RUN chmod 600 /root/.ssh/bitbucket-readonly && \
    ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts && \
    ssh-keyscan github.com >> /root/.ssh/known_hosts

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
RUN cat /root/.ssh/atlas-jsonschema-readonly > /etc/ssh/id_rsa && \
    chmod 600 /etc/ssh/id_rsa && \
    eval $(ssh-agent -s) && \
    ssh-add /etc/ssh/id_rsa && \
    cd /app && \
    yarn

# build and compile the source
RUN yarn build

# trim to production dependencies post build
RUN cp -rf /app/node_modules/makeandship-api-common /tmp
RUN rm -rf /app/node_modules
RUN cd /app && yarn --ignore-scripts --production
RUN cp -rf /tmp/makeandship-api-common /app/node_modules

# Remove SSH keys
RUN rm /app/bitbucket-readonly
RUN rm -rf /home/go/.ssh
RUN rm /etc/ssh/id_rsa
RUN rm -rf /tmp/makeandship-api-common

# run local api on 3000
EXPOSE 3000

# run up the server
CMD NODE_ENV=$NODE_ENV forever -l forever.log -o out.log -e err.log /app/dist/index.js
