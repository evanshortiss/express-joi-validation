# express-joi-validation

![TravisCI](https://travis-ci.org/evanshortiss/express-joi-validation.svg) [![npm version](https://badge.fury.io/js/express-joi-validation.svg)](https://badge.fury.io/js/express-joi-validation) [![Coverage Status](https://coveralls.io/repos/github/evanshortiss/express-joi-validation/badge.svg?branch=master)](https://coveralls.io/github/evanshortiss/express-joi-validation?branch=master)

A middleware for validating express inputs using Joi schemas. Fills some of the
voids I found that other Joi middleware miss such as:

* Allow the developers to easily specify the order in which request inputs are
validated.
* Replaces the `req.body` and others with converted Joi values. The same applies
for headers, query, and params, but...
* Retains the original `req.body` inside a new property named `req.originalBody`
. The same applies for headers, query, and params using the `original` prefix,
e.g `req.originalQuery` will contain the `req.query` as it looked *before*
validation.
* Passes sensible default options to Joi for headers, params, query, and body.
These are detailed below.
* Uses `peerDependencies` to get a Joi instance of your choosing instead of
using a fixed version.



## Install

You need to install `joi` along with this module for it to work since it relies
on it as a peer dependency. Currently this module has only been tested with joi
version 10.0 and higher.

```
# we install our middleware AND joi since it's required by our middleware
npm i express-joi-validation joi --save
```


## Example Code

An example application can be found in the [example/](https://github.com/evanshortiss/express-joi-validation/tree/master/example)
folder of this repository.


## Usage

```js
const Joi = require('joi');
const validator = require('express-joi-validation')({});

const app = require('express')();
const orders = require('lib/orders');

const querySchema = Joi.object({
  type: Joi.string().required().valid('food', 'drinks', 'entertainment'),
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required()
});

// Allow unknown fields in the query. This is not allowed by default
const joiOpts = {
  allowUnknown: true
};

app.get('/orders', validator.query(querySchema, {joi: joiOpts}), (req, res, next) => {
  console.log(
    `Compare the incoming query ${JSON.stringify(req.originalQuery)} vs. the sanatised query ${JSON.stringify(req.query)}`
  );
  // if we're in here then the query was valid!
  orders.getForQuery(req.query)
    .then((listOfOrders) => res.json(listOfOrders))
    .catch(next);
});
```


## Behaviours

### Joi Versioning
This module uses `peerDependencies` for the Joi version being used. This means
whatever Joi version is in the `dependencies` of your `package.json` will be
used by this module.

### Validation Ordering
If you'd like to validate different request inputs in differing orders it's
simple, just define the the middleware in the order desired.

Here's an example where we do headers, body, and finally the query:

```js
// verify headers, then body, then query
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

A `passError` option is supported to override this behaviour, and force the
middleware to pass the error to the express error handler you've defined.

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

The following sensible defaults are applied if you pass none:

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


## Custom Express Error handler

If you don't like the default error format returned by this module you can
override it like so:

```js
const validator = require('express-joi-validation')({
  passError: true // NOTE: this tells the module to pass the error along for you
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
  if (err.error.isJoi) {
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


## API

### module(config)

A factory function an instance of the module for use. Can pass the following
options:

* passError - Set this to true if you'd like validation errors to get passed
to the express error handler so you can handle them manually vs. the default behaviour that returns a 400.
* statusCode - The status code to use when validation fails and _passError_
is false. Default is 400.

### Instance Functions

Each instance function can be passed an options Object with the following:

* joi - Custom options to pass to `Joi.validate`.
* passError - Same as above.
* statusCode - Same as above.

#### instance.query(schema, [options])
Create a middleware instance that will validate the query for an incoming
request. Can be passed `options` that override the options passed when the
instance was created.

#### instance.body(schema, [options])
Create a middleware instance that will validate the body for an incoming
request. Can be passed `options` that override the options passed when the
instance was created.

#### instance.headers(schema, [options])
Create a middleware instance that will validate the headers for an incoming
request. Can be passed `options` that override the options passed when the
instance was created.

#### instance.params(schema, [options])
Create a middleware instance that will validate the params for an incoming
request. Can be passed `options` that override the options passed when the
instance was created.

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
