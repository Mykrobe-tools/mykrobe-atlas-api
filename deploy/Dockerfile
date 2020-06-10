FROM node:12.13.0
LABEL MAINTAINER="Yassire Elhani <yassire@makeandship.com>"

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# server installation directory
WORKDIR /home/node/app
RUN mkdir /home/node/.npm-global

# push this app to the deployment directory
ADD dist /home/node/app/dist
ADD node_modules /home/node/app/node_modules

RUN chown -R node:node /home/node/.npm-global
RUN chown -R node:node /home/node/app

USER node

# install global packages
RUN yarn global add forever

# run local api on 3000
EXPOSE 3000

# run up the server
# CMD node /home/node/app/dist/index.js
CMD NODE_ENV=$NODE_ENV forever -l /home/node/data/logs/forever.log -o /home/node/data/logs/out.log -e /home/node/data/logs/err.log /home/node/app/dist/index.js
