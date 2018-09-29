'use strict'
exports.__esModule = true
var port = 3030
var express = require('express')
var Joi = require('joi')
var validation = require('../../express-joi-validation')
var app = express()
var validator = validation()
var headerSchema = Joi.object({
  host: Joi.string().required(),
  'user-agent': Joi.string().required()
})
app.use(validator.headers(headerSchema))
app.get('/ping', function(req, res) {
  return res.end('pong')
})
app.listen(3030, function(err) {
  if (err) {
    throw err
  }
  console.log('\napp started on ' + port + '\n')
  console.log(
    'Try accessing http://localhost:' +
      port +
      '/users/1001 or http://localhost:' +
      port +
      '/users?name=dean to get some data.\n'
  )
  console.log(
    'Now try access http://localhost:' +
      port +
      '/users?age=50. You should get an error complaining that your querystring is invalid.'
  )
})
