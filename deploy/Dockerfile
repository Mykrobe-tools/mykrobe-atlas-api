FROM ubuntu:14.04
LABEL MAINTAINER="Yassire Elhani <yassire@makeandship.com>"

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV NODE_VERSION 8.12.0
ENV NVM_DIR /usr/local/nvm

RUN echo "deb mirror://mirrors.ubuntu.com/mirrors.txt trusty main restricted universe multiverse" > /etc/apt/sources.list; \
    echo "deb mirror://mirrors.ubuntu.com/mirrors.txt trusty-updates main restricted universe multiverse" >> /etc/apt/sources.list; \
    echo "deb mirror://mirrors.ubuntu.com/mirrors.txt trusty-backports main restricted universe multiverse" >> /etc/apt/sources.list; \
    echo "deb mirror://mirrors.ubuntu.com/mirrors.txt trusty-security main restricted universe multiverse" >> /etc/apt/sources.list

# install required software before using nvm/node/npm/bower
RUN apt-get update 
RUN apt-get install -y curl 
RUN apt-get install -y git 
RUN apt-get install -y python 
RUN apt-get install -y build-essential 
RUN apt-get install -y libssl-dev

# add package manager for yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" >> /etc/apt/sources.list

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
RUN ls -la /home/go/.ssh
RUN mkdir -p /home/go/.ssh && \
    chmod 0700 /home/go/.ssh && \
    echo "IdentityFile /home/go/.ssh/bitbucket-readonly" >> /home/go/.ssh/config

ADD /home/go/.ssh/bitbucket-readonly /home/go/.ssh/
ADD /home/go/.ssh/atlas-jsonschema-readonly /home/go/.ssh/

RUN chmod 600 /home/go/.ssh/bitbucket-readonly && \
    ssh-keyscan bitbucket.org >> /home/go/.ssh/known_hosts && \
    ssh-keyscan github.com >> /home/go/.ssh/known_hosts

# install yarn
RUN apt-get install apt-transport-https
RUN npm install -g yarn

# install global packages
RUN yarn global add forever

# server installation directory
RUN mkdir /app

# push this app to the deployment directory
WORKDIR /app
ADD . /app

# install dependencies as a cachable step
RUN cat /home/go/.ssh/atlas-jsonschema-readonly > /etc/ssh/id_rsa && \
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
