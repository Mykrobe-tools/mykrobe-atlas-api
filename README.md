# Atlas

A RESTful API using:

- [Express](http://expressjs.com)
- Mongoose
- [ES6](http://es6-features.org)
- [Jest](https://facebook.github.io/jest/) for tests and coverage
- [JsonWebToken](https://jwt.io) authentication

## Install

First, clone the repo then install dependencies.

```
$ npm install -g yarn
$ yarn
```

Configure local environment variables

```
$ cp .env.sample .env
```

Update `.env`

## Database setup

Install the MongoDB Binaries

```
$ brew install mongodb
```

Add the following entry to /etc/hosts file

```
127.0.0.1 docker.for.mac.localhost
```

Run MongoDB Replicaset

```
$ cd mongo && ./setup
```

inside the mongo console run this:

```
rs.initiate({_id:"rs0", members: [{_id:0, host:"docker.for.mac.localhost:27017", priority:100}, {_id:1, host:"docker.for.mac.localhost:27018", priority:50}]})
```

check the status

```
rs.status();
```

## Start Server

```
$ yarn start
```

To use logging

```
$ yarn start:debug
```

To log nock calls

```
DEBUG=nock.interceptor yarn start
```

To log agenda calls

```
DEBUG=agenda:job yarn start
```

To log both use a comma separated set of debug targets

## Tests

Run tests along with code coverage

```
$ yarn test
```

Run tests on file change

```
$ yarn test:watch
```

## Linting

Lint code with ESLint

```
$ yarn lint
```

Run lint on file change

```
$ yarn lint:watch
```

### Clean repository

Wipe out dist and coverage directory

```
$ gulp clean
```

### Enable git hooks

Install husky using yarn

```
$ yarn add --dev husky --force
```

### API documentation

```
http://host/swagger.json
```

### Load the results from json files

Run this command to load the results from json files in /path/to/folder

```
$ yarn results:load --folder=/path/to/folder --username=<username> --password=<password> --basePath=<apiBasePath>
```

### AWS KEYS

Add your aws keys as environment variables.

```
AWS_ACCESS_KEY_ID = [your access key id]
AWS_SECRET_ACCESS_KEY = [your secret access key]
AWS_SESSION_TOKEN (optional) = [your session token]
```

### Documentation

Some useful documents for managing the queues in a js application:

http://queues.io

https://github.com/chilts/mongodb-queue

https://ifelse.io/2016/02/23/using-node-redis-and-kue-for-priority-job-processing/
