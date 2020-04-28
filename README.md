# Hapi Postgres Connection (for Hapi v.19)

![hapi-postgres-connection](https://cloud.githubusercontent.com/assets/194400/13723469/73b5d8f2-e85e-11e5-82dc-943e7ebccdce.png)

Creates a PostgreSQL Connection available anywhere in your Hapi application.

[![Build Status](https://travis-ci.org/dwyl/hapi-postgres-connection.svg?branch=master)](https://travis-ci.org/dwyl/hapi-postgres-connection)
[![codecov.io](https://codecov.io/github/dwyl/hapi-postgres-connection/coverage.svg?branch=master)](https://codecov.io/github/dwyl/hapi-postgres-connection?branch=master)
[![Code Climate](https://codeclimate.com/github/dwyl/hapi-postgres-connection/badges/gpa.svg)](https://codeclimate.com/github/dwyl/hapi-postgres-connection)
[![devDependency Status](https://david-dm.org/dwyl/hapi-postgres-connection/dev-status.svg)](https://david-dm.org/dwyl/hapi-postgres-connection#info=devDependencies)
[![Dependency Status](https://david-dm.org/dwyl/hapi-postgres-connection.svg)](https://david-dm.org/dwyl/hapi-postgres-connection)
[![npm](https://img.shields.io/npm/v/hapi-postgres-connection.svg)](https://www.npmjs.com/package/hapi-postgres-connection)
[![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## *Why*?

You are building a PostgreSQL-backed Hapi.js Application
but don't want to be initialising a connection to Postgres
in your route handler because it's *slow* and can lead
to [*interesting* errors](https://github.com/brianc/node-postgres/issues/725) ...
so instead, you spend 1 minute to include a *tiny, tried & tested* plugin
that makes Postgres available in all your route handlers.

> Got *any questions*? *ask*!! <https://github.com/dwyl/hapi-postgres-connection/issues>

## *What*?

This Hapi Plugin creates a Connection to PostgreSQL when your
server starts up and makes it available *anywhere* in your app's
route handlers via `request.pg.client`.

When you shut down your server (*e.g. the `server.stop` in your tests*)
the connection is closed for you.

### *One Dependency*: `node-postgres` *always up-to-date*

This plugin uses <https://github.com/brianc/node-postgres>
the *most popular* (*actively maintained*) node PostgreSQL Client.

## *How*?

### 1. *Download/Install* from NPM or Yarn

```sh
npm install hapi-postgres-connection --save
```

or

```sh
yarn add hapi-postgres-connection
```

### 2. *Initialize* the plugin in your Hapi Server

in your server:

```js
const HapiPostgresConnection = require('hapi-postgres-connection');

await server.register({
  plugin: HapiPostgresConnection
});
```

Now *all* your route handlers have access to Postgres
via: `request.pg.client`

You also can also access Postgres through the `getCon` method on the Hapi Postgres Connection module: `const pg = require('hapi-postgres-connection').getCon();`

This method may be useful when do not have access to the request
object.

### 3. Using Postgres Client in your Route Handler

```js
server.route({
  method: 'GET',
  path: '/',
  handler: async function(request, h) {
    let email = 'test@test.net';
    let select = `SELECT * FROM people WHERE ${email}`;

    try {
      const result = await request.pg.client.query(insertData);
      console.log(result);
      return h.response(result.rows[0]);
    } catch (err) {
      console.log(err);
    }
  }
});
```

### *Required/Expected* Environment Variable: `DATABASE_URL`

The plugin *expects* (*requires*) that you have an Environment Variable set
for the Postgres Connection URL: `DATABASE_URL` in the format:
`postgres://username:password@localhost/database`

This is the default used by [*Heroku*](https://www.heroku.com/postgres)
so we figured it made sense to keep it.

> If you are unsure how to set the Environment Variable
or why this is a *good idea*  
(*hard-coding values in your app is a really bad idea...*)  
please see: <https://github.com/dwyl/learn-environment-variables>

### *Optional* Environment Variable: `DATABASE_SSL`

If your database connection requires the use of SSL, you can set `DATABASE_SSL` environment
variable to true and the pool connection will be done accordingly. This is required
(for example) by databases hosted on [*Heroku*]
(<https://devcenter.heroku.com/articles/heroku-postgresql#heroku-postgres-ssl).>

## *Q*: Don't We need to Close the Postgres Connection?

***A***: No! The plugin handles closing the connection for you!


## *Implementation Detail*

To run the tests *locally* you will need to have
a running instance of PostgreSQL with a database called `test` available.

Then set your `DATABASE_URL` Environment Variable, on my localhost its:

```sh
export DATABASE_URL=postgres://postgres:@localhost/test
```

(*the default `postgres` user does not have a password on localhost*)

## *Motivation?*

We were doing postgres connections the *hard* way in our app(s) ...
We knew there had to be a *better* way
After a few hours of [googling and code-reviewing](https://github.com/dwyl/hapi-login-example-postgres/issues/6)
we decided to write our own little plugin to simplify things.
