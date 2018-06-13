FROM ubuntu:14.04
LABEL MAINTAINER="Yassire Elhani <yassire@makeandship.com>"

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV NODE_VERSION 8.11.2
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

RUN chmod 600 /root/.ssh/bitbucket-readonly && \
    ssh-keyscan bitbucket.org > /root/.ssh/known_hosts

# install global packages
RUN npm install -g forever

# server installation directory
RUN mkdir /app

# install dependencies as a cachable step
ADD package.json /tmp/package.json
RUN cd /tmp && npm install

# push this app to the deployment directory
WORKDIR /app
ADD . /app

# move cached installs into the app
RUN cp -a /tmp/node_modules /app/

# build and compile the source
RUN npm install -g gulp
RUN gulp

# install apidoc
RUN npm install -g apidoc

# Remove SSH keys
RUN rm /app/bitbucket-readonly
RUN rm -rf /root/.ssh
RUN rm -rf /tmp/makeandship-api-common

# run local api on 3000
EXPOSE 3000

# run up the server
CMD NODE_ENV=$NODE_ENV forever -l forever.log -o out.log -e err.log /app/dist/index.js
