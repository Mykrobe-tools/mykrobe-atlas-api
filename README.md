# Atlas

A RESTful api using [Express](http://expressjs.com) and mongoose in [ES6](http://es6-features.org) 
with [jest](https://facebook.github.io/jest/) for tests and coverage 
and [JsonWebToken](https://jwt.io) authentication.

## Install

First, clone the repo then install dependencies.

```
$ npm install -g yarn
$ yarn
```

## Database setup

Install the MongoDB Binaries

```
$ brew install mongodb
```

Run MongoDB

```
$ mongod
```

## Start Server

```
$ yarn start
```

### Tests

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

### Generate API documentation

Install apidoc via npm

```
$ npm install -g apidoc
```

Generate the doc

```
$ apidoc -i server/
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