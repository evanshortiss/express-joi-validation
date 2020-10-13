'use strict'

process.title = 'express-joi-validation'

const port = 8080

const app = require('express')()
const Joi = require('joi')
const validator = require('../../').createValidator()

const headerSchema = Joi.object({
  host: Joi.string().required(),
  'user-agent': Joi.string().required()
})

app.use(validator.headers(headerSchema))

app.use('/users', require('./router'))

app.listen(port, err => {
  if (err) {
    throw err
  }

  console.log(`\napp started on ${port}\n`)
  console.log(
    `Try accessing http://localhost:${port}/users/1001 or http://localhost:${port}/users?name=barry to get some data.\n`
  )
  console.log(
    `Now try access http://localhost:${port}/users?age=50. You should get an error complaining that your querystring is invalid.`
  )
})
