# nextjs-interview / TodoApi

[![Open in Coder](https://dev.crunchloop.io/open-in-coder.svg)](https://dev.crunchloop.io/templates/fly-containers/workspace?param.Git%20Repository=git@github.com:crunchloop/nextjs-interview.git)

This is a simple Todo List API built in Nest JS and Typescript. This project is currently being used for Javascript/Typescript full-stack candidates.

## Installation

```bash
$ npm install
```

## Database

The app expects Postgres. Two ways to run it:

- **Docker (recommended):** from your *host* machine, run `docker compose up -d`.
  It starts the `postgres` service plus a devcontainer as the `app` service —
  so do **not** run docker from inside the container (no docker there). Open the
  devcontainer, then `npm run start` connects to `postgres` over the compose
  network.
- **Local Postgres:** the app falls back to `localhost:5432`, user/password
  `postgres`, database `nestjs_db`. Override via `DB_HOST`, `DB_PORT`,
  `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` env vars.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API docs (Swagger)

Once the app is running, browse the Swagger UI at:

http://localhost:3000/api/docs

It lets you explore every endpoint and try requests directly from the browser.
The OpenAPI JSON behind it is served at `http://localhost:3000/api/docs-json`.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Check integration tests at: (https://github.com/crunchloop/interview-tests)

## Contact

- Martín Fernández (mfernandez@crunchloop.io)

## About Crunchloop

![crunchloop](https://s3.amazonaws.com/crunchloop.io/logo-blue.png)

We strongly believe in giving back :rocket:. Let's work together [`Get in touch`](https://crunchloop.io/#contact).
