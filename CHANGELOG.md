## CHANGELOG
Date format is DD/MM/YYYY

## 5.0.0 (13/10/2020)
* Drop Node.js 8 support.
* Update to use Joi v17.x.
* Change from using peerDependency of "@hapi/joi" to "joi".

## 4.0.3 (18/11/2019)
* Fix TypeScript example in the README.

## 4.0.2 (12/11/2019)
* Apply a fix for compatibility with Joi v16 typings.

## 4.0.1 (24/09/2019)
* Remove outdated "joi" option in README

## 4.0.0 (20/09/2019)
* Update to support Joi v16.x
* No longer supports passing a Joi instance to factory
* Finally removed deprecated function on `module.exports` from v2

## 3.0.0 (30/08/2019)
* Removed `fields`, `originalQuery`, `originalHeaders`, `originalBody`,
`originalParams`, and `originalFields` from `ValidatedRequest`. This simplifies
usage with TypeScript's *strict* mode.
* Added `ValidatedRequestWithRawInputsAndFields`. This is the same as
`ValidatedRequest` from versions 2.x.

## 2.0.1 (22/08/2019)
* Fixed compilation issue with TypeScript example when `strict` compiler flag is `true`.
* Updated test script to include building TypeScript example

## 2.0.0 (27/06/2019)
* Improved TypeScript support with better typings
* Changed export from a factory function to a module exposing `createValidator()` 
* Improved TypeScript examples and README

## 1.0.0 (13/06/2019)
* Migrated from `joi` to `@hapi/joi`.
* Dropped Node.js 6 & 7 support (@hapi/joi forces this)
* Update dev dependencies.

## 0.3.0 (29/09/2018)
* Add response validation
* Update dependencies
* Drop support for Node.js 4 and below
* Remove @types/express from dependencies

## 0.2.1 (28/10/2017)
* Ensure "typings" are defined in package.json

## 0.2.0 (28/10/2017)
* Add TypeScript support
* Add new `fields` function for use with express-formidable

## 0.1.0 (16/04/2017)
* Initial release.
