# express-joi-validation

![TravisCI](https://travis-ci.org/evanshortiss/express-joi-validation.svg)
[![Coverage Status](https://coveralls.io/repos/github/evanshortiss/express-joi-validation/badge.svg?branch=master)](https://coveralls.io/github/evanshortiss/express-joi-validation?branch=master)
[![npm version](https://badge.fury.io/js/express-joi-validation.svg)](https://www.npmjs.com/package/express-joi-validation)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](http://www.typescriptlang.org/)
[![npm downloads](https://img.shields.io/npm/dm/express-joi-validation.svg?style=flat)](https://www.npmjs.com/package/express-joi-validation)
[![Known Vulnerabilities](https://snyk.io//test/github/evanshortiss/express-joi-validation/badge.svg?targetFile=package.json)](https://snyk.io//test/github/evanshortiss/express-joi-validation?targetFile=package.json)

A middleware for validating express inputs using Joi schemas. Features include:

* TypeScript support.
* Specify the order in which request inputs are validated.
* Replaces the incoming `req.body`, `req.query`, etc and with the validated result 
* Retains the original `req.body` inside a new property named `req.originalBody`.
. The same applies for headers, query, and params using the `original` prefix,
e.g `req.originalQuery`
* Chooses sensible default Joi options for headers, params, query, and body.
* Uses `peerDependencies` to get a Joi instance of your choosing instead of
using a fixed version.

## Quick Links

* [API](#api)
* [Usage (JavaScript)](#usage-javascript)
* [Usage (TypeScript)](#usage-typescript)
* [Behaviours](#behaviours)
  * [Joi Versioning](#joi-versioning)
  * [Validation Ordering](#validation-ordering)
  * [Error Handling](#error-handling)
  * [Joi Options](#joi-options)
  * [Custom Express Error Handler](#custom-express-error-handler)

## Install

You need to install `joi` with this module since it relies on it in
`peerDependencies`.

```
npm i express-joi-validation joi --save
```

## Example
A JavaScript and TypeScript example can be found in the `example/` folder of
this repository.

## Usage (JavaScript)

```js
const Joi = require('joi')
const app = require('express')()
const validator = require('express-joi-validation').createValidator({})

const querySchema = Joi.object({
  name: Joi.string().required()
})

app.get('/orders', validator.query(querySchema), (req, res) => {
  // If we're in here then the query was valid!  
  res.end(`Hello ${req.query.name}!`)
})
```

## Usage (TypeScript)

For TypeScript a helper `ValidatedRequest` and
`ValidatedRequestWithRawInputsAndFields` type is provided. This extends the
`express.Request` type and allows you to pass a schema using generics to
ensure type safety in your handler function.

```ts
import * as Joi from 'joi'
import * as express from 'express'
import {
  ContainerTypes,
  // Use this as a replacement for express.Request
  ValidatedRequest,
  // Extend from this to define a valid schema type/interface
  ValidatedRequestSchema,
  // Creates a validator that generates middlewares
  createValidator
} from 'express-joi-validation'

const app = express()
const validator = createValidator()

const querySchema = Joi.object({
  name: Joi.string().required()
})

interface HelloRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: {
    name: string
  }
}

app.get(
  '/hello',
  validator.query(querySchema),
  (req: ValidatedRequest<HelloRequestSchema>, res) => {
    // Woohoo, type safety and intellisense for req.query!
    res.end(`Hello ${req.query.name}!`)
  }
)
```

You can minimise some duplication by using [joi-extract-type](https://github.com/TCMiranda/joi-extract-type/).

_NOTE: this does not work with Joi v16+ at the moment. See [this issue](https://github.com/TCMiranda/joi-extract-type/issues/23)._

```ts
import * as Joi from 'joi'
import * as express from 'express'
import {
  // Use this as a replacement for express.Request
  ValidatedRequest,
  // Extend from this to define a valid schema type/interface
  ValidatedRequestSchema,
  // Creates a validator that generates middlewares
  createValidator
} from 'express-joi-validation'

// This is optional, but without it you need to manually generate
// a type or interface for ValidatedRequestSchema members
import 'joi-extract-type'

const app = express()
const validator = createValidator()

const querySchema = Joi.object({
  name: Joi.string().required()
})

interface HelloRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: Joi.extractType<typeof querySchema>

  // Without Joi.extractType you would do this:
  // query: {
  //   name: string
  // }
}

app.get(
  '/hello',
  validator.query(querySchema),
  (req: ValidatedRequest<HelloRequestSchema>, res) => {
    // Woohoo, type safety and intellisense for req.query!
    res.end(`Hello ${req.query.name}!`)
  }
)
```

## API

### Structure

* module (express-joi-validation)
  * [createValidator(config)](#createvalidatorconfig)
    * [query(options)](#validatorqueryschema-options)
    * [body(options)](#validatorbodyschema-options)
    * [headers(options)](#validatorheadersschema-options)
    * [params(options)](#validatorparamsschema-options)
    * [response(options)](#validatorresponseschema-options)
    * [fields(options)](#validatorfieldsschema-options)

### createValidator(config)
Creates a validator. Supports the following options:

* passError (default: `false`) - Passes validation errors to the express error
hander using `next(err)` when `true`
* statusCode (default: `400`) - The status code used when validation fails and
`passError` is `false`.

#### validator.query(schema, [options])
Creates a middleware instance that will validate the `req.query` for an
incoming request. Can be passed `options` that override the config passed
when the validator was created.

Supported options are:

* joi - Custom options to pass to `Joi.validate`.
* passError - Same as above.
* statusCode - Same as above.

#### validator.body(schema, [options])
Creates a middleware instance that will validate the `req.body` for an incoming
request. Can be passed `options` that override the options passed when the
validator was created.

Supported options are the same as `validator.query`.

#### validator.headers(schema, [options])
Creates a middleware instance that will validate the `req.headers` for an
incoming request. Can be passed `options` that override the options passed
when the validator was created.

Supported options are the same as `validator.query`.

#### validator.params(schema, [options])
Creates a middleware instance that will validate the `req.params` for an
incoming request. Can be passed `options` that override the options passed
when the validator was created.

Supported options are the same as `validator.query`.

#### validator.response(schema, [options])
Creates a middleware instance that will validate the outgoing response.
Can be passed `options` that override the options passed when the instance was
created.

Supported options are the same as `validator.query`.

#### validator.fields(schema, [options])
Creates a middleware instance that will validate the fields for an incoming
request. This is designed for use with `express-formidable`. Can be passed
`options` that override the options passed when the validator was created.

The `instance.params` middleware is a little different to the others. It _must_
be attached directly to the route it is related to. Here's a sample:

```js
const schema = Joi.object({
  id: Joi.number().integer().required()
});

// INCORRECT
app.use(validator.params(schema));
app.get('/orders/:id', (req, res, next) => {
  // The "id" parameter will NOT have been validated here!
});

// CORRECT
app.get('/orders/:id', validator.params(schema), (req, res, next) => {
  // This WILL have a validated "id"
})
```

Supported options are the same as `validator.query`.

## Behaviours

### Joi Versioning
This module uses `peerDependencies` for the Joi version being used.
This means whatever `joi` version is in the `dependencies` of your
`package.json` will be used by this module.


### Validation Ordering
Validation can be performed in a specific order using standard express
middleware behaviour. Pass the middleware in the desired order.

Here's an example where the order is headers, body, query:

```js
route.get(
  '/tickets',
  validator.headers(headerSchema),
  validator.body(bodySchema),
  validator.query(querySchema),
  routeHandler
);
```

### Error Handling
When validation fails, this module will default to returning a HTTP 400 with
the Joi validation error as a `text/plain` response type.

A `passError` option is supported to override this behaviour. This option
forces the middleware to pass the error to the express error handler using the
standard `next` function behaviour.

See the [Custom Express Error Handler](#custom-express-error-handler) section
for an example.

### Joi Options
It is possible to pass specific Joi options to each validator like so:

```js
route.get(
  '/tickets',
  validator.headers(
    headerSchema,
    {
      joi: {convert: true, allowUnknown: true}
    }
  ),
  validator.body(
    bodySchema,
    {
      joi: {convert: true, allowUnknown: false}
    }
  )
  routeHandler
);
```

The following sensible defaults for Joi are applied if none are passed:

#### Query
* convert: true
* allowUnknown: false
* abortEarly: false

#### Body
* convert: true
* allowUnknown: false
* abortEarly: false

#### Headers
* convert: true
* allowUnknown: true
* stripUnknown: false
* abortEarly: false

#### Route Params
* convert: true
* allowUnknown: false
* abortEarly: false

#### Fields (with express-formidable)
* convert: true
* allowUnknown: false
* abortEarly: false


## Custom Express Error Handler

```js
const validator = require('express-joi-validation').createValidator({
  // This options forces validation to pass any errors the express
  // error handler instead of generating a 400 error
  passError: true
});

const app = require('express')();
const orders = require('lib/orders');

app.get('/orders', validator.query(require('./query-schema')), (req, res, next) => {
  // if we're in here then the query was valid!
  orders.getForQuery(req.query)
    .then((listOfOrders) => res.json(listOfOrders))
    .catch(next);
});

// After your routes add a standard express error handler. This will be passed the Joi
// error, plus an extra "type" field so we can tell what type of validation failed
app.use((err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    // we had a joi error, let's return a custom 400 json response
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      message: err.error.toString()
    });
  } else {
    // pass on to another error handler
    next(err);
  }
});
```

In TypeScript environments `err.type` can be verified against the exported
`ContainerTypes`:

```ts
import { ContainerTypes } from 'express-joi-validation'

app.use((err: any|ExpressJoiError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // ContainerTypes is an enum exported by this module. It contains strings
  // such as "body", "headers", "query"...
  if (err && 'type' in err && err.type in ContainerTypes) {
    const e: ExpressJoiError = err
    // e.g "You submitted a bad query paramater"
    res.status(400).end(`You submitted a bad ${e.type} paramater`)
  } else {
    res.status(500).end('internal server error')
  }
})
```

