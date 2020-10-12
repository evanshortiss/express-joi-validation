'use strict'

const Joi = require('joi')
const sinon = require('sinon')
const supertest = require('supertest')
const expect = require('chai').expect

describe('express joi', function() {
  var schema, mod

  function getRequester(middleware) {
    const app = require('express')()

    // Must apply params middleware inline with the route to match param names
    app.get('/params-check/:key', middleware, (req, res) => {
      expect(req.params).to.exist
      expect(req.originalParams).to.exist

      expect(req.params.key).to.be.a('number')
      expect(req.originalParams.key).to.be.a('string')

      res.end('ok')
    })

    // Configure some dummy routes
    app.get('/headers-check', middleware, (req, res) => {
      expect(req.headers).to.exist
      expect(req.originalHeaders).to.exist

      expect(req.headers.key).to.be.a('number')
      expect(req.originalHeaders.key).to.be.a('string')

      res.end('ok')
    })

    app.get('/query-check', middleware, (req, res) => {
      expect(req.query).to.exist
      expect(req.originalQuery).to.exist

      expect(req.query.key).to.be.a('number')
      expect(req.originalQuery.key).to.be.a('string')

      res.end('ok')
    })

    app.post(
      '/body-check',
      require('body-parser').json(),
      middleware,
      (req, res) => {
        expect(req.body).to.exist
        expect(req.originalBody).to.exist

        expect(req.body.key).to.be.a('number')
        expect(req.originalBody.key).to.be.a('string')

        res.end('ok')
      }
    )

    app.post(
      '/global-joi-config',
      require('body-parser').json(),
      middleware,
      (req, res) => {
        expect(req.body).to.exist
        expect(req.originalBody).to.exist

        expect(req.originalBody.known).to.exist
        expect(req.originalBody.known).to.exist

        expect(req.originalBody.unknown).to.exist
        expect(req.originalBody.unknown).to.exist

        res.end('ok')
      }
    )

    app.post(
      '/fields-check',
      require('express-formidable')(),
      middleware,
      (req, res) => {
        expect(req.fields).to.exist
        expect(req.originalFields).to.exist

        expect(req.fields.key).to.be.a('number')
        expect(req.originalFields.key).to.be.a('string')

        res.end('ok')
      }
    )
    app.get('/response/:key', middleware, (req, res) => {
      const { key } = req.params
      res.json({ key: +key || 'none' })
    })

    return supertest(app)
  }

  beforeEach(function() {
    require('clear-require').all()

    schema = Joi.object({
      key: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required()
    })

    mod = require('./express-joi-validation.js').createValidator()
  })

  describe('#headers', function() {
    it('should return a 200 since our request is valid', function(done) {
      const mw = mod.headers(schema)

      getRequester(mw)
        .get('/headers-check')
        .expect(200)
        .set('key', '10')
        .end(done)
    })

    it('should return a 400 since our request is invalid', function(done) {
      const mw = mod.headers(schema)

      getRequester(mw)
        .get('/headers-check')
        .expect(400)
        .set('key', '150')
        .end(function(err, res) {
          expect(res.text).to.contain('"key" must be less than or equal to 10')
          done()
        })
    })
  })

  describe('#query', function() {
    it('should return a 200 since our querystring is valid', function(done) {
      const mw = mod.query(schema)

      getRequester(mw)
        .get('/query-check?key=5')
        .expect(200)
        .end(done)
    })

    it('should return a 400 since our querystring is invalid', function(done) {
      const mw = mod.query(schema)

      getRequester(mw)
        .get('/query-check')
        .expect(400)
        .end(function(err, res) {
          expect(res.text).to.contain('"key" is required')
          done()
        })
    })
  })

  describe('#body', function() {
    it('should return a 200 since our body is valid', function(done) {
      const mw = mod.body(schema)

      getRequester(mw)
        .post('/body-check')
        .send({
          key: '1'
        })
        .expect(200)
        .end(done)
    })

    it('should return a 400 since our body is invalid', function(done) {
      const mw = mod.body(schema)

      getRequester(mw)
        .post('/body-check')
        .expect(400)
        .end(function(err, res) {
          expect(res.text).to.contain('"key" is required')
          done()
        })
    })
  })

  describe('#fields', function() {
    it('should return a 200 since our fields are valid', function(done) {
      const mw = mod.fields(schema)

      getRequester(mw)
        .post('/fields-check')
        .field('key', '1')
        .expect(200)
        .end(done)
    })

    it('should return a 400 since our body is invalid', function(done) {
      const mw = mod.fields(schema)

      getRequester(mw)
        .post('/fields-check')
        .expect(400)
        .end(function(err, res) {
          expect(res.text).to.contain('"key" is required')
          done()
        })
    })
  })

  describe('#params', function() {
    it('should return a 200 since our request param is valid', function(done) {
      const mw = mod.params(schema)

      getRequester(mw)
        .get('/params-check/3')
        .expect(200)
        .end(done)
    })

    it('should return a 400 since our param is invalid', function(done) {
      const mw = mod.params(schema)

      getRequester(mw)
        .get('/params-check/not-a-number')
        .expect(400)
        .end(function(err, res) {
          expect(res.text).to.contain('"key" must be a number')
          done()
        })
    })
  })

  describe('#response', function() {
    it('should return a 500 when the key is not valid', function() {
      const middleware = mod.response(schema)
      return getRequester(middleware)
        .get('/response/one')
        .expect(500)
    })

    it('should return a 200 when the key is valid', function() {
      const middleware = mod.response(schema)
      return getRequester(middleware)
        .get('/response/1')
        .expect(200)
    })

    it('should pass an error to subsequent handler if it is asked', function() {
      const middleware = mod.response(schema, {
        passError: true
      })
      return getRequester(middleware)
        .get('/response/one')
        .expect(500)
    })

    it('should return an alternative status for failure', function() {
      const middleware = mod.response(schema, {
        statusCode: 422
      })
      return getRequester(middleware)
        .get(`/response/one`)
        .expect(422)
    })
  })

  describe('optional configs', function() {
    it('should call next on error via config.passError', function(done) {
      const mod = require('./express-joi-validation.js').createValidator({
        passError: true
      })
      const mw = mod.query(
        Joi.object({
          key: Joi.string()
            .required()
            .valid('only-this-is-valid')
        })
      )

      mw({ query: { key: 'not valid' } }, {}, err => {
        expect(err.type).to.equal('query')
        expect(err.error.isJoi).to.be.true
        expect(err.value).to.be.an('object')
        done()
      })
    })
  })

  describe('#joiGlobalOptionMerging.', function() {
    it('should return a 200 since our body is valid', function(done) {
      const mod = require('./express-joi-validation.js').createValidator({
        passError: true,
        joi: {
          allowUnknown: true
        }
      })
      const schema = Joi.object({
        known: Joi.boolean().required()
      })

      const mw = mod.body(schema)

      getRequester(mw)
        .post('/global-joi-config')
        .send({
          known: true,
          unknown: true
        })
        .expect(200)
        .end(done)
    })
  })
})
