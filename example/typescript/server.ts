'use strict'

const port = 3030

import * as express from 'express'
import * as Joi from '@hapi/joi'
import * as HelloWorld from './route'
import { createValidator } from '../../express-joi-validation';

const app = express()
const validator = createValidator()

const headerSchema = Joi.object({
  host: Joi.string().required(),
  'user-agent': Joi.string().required()
})

// Validate headers for all incoming requests
app.use(validator.headers(headerSchema))

// No extra validations performed on this simple ping endpoint
app.get('/ping', (req, res) => {
  res.end('pong')
})

app.use('/hello', HelloWorld)

app.listen(port, (err: any) => {
  if (err) {
    throw err
  }

  console.log(`\napp started on ${port}\n`)
  console.log(
    `Try accessing http://localhost:${port}/ping or http://localhost:${port}/hello?name=dean to get some data.\n`
  )
  console.log(
    `Now try access hhttp://localhost:${port}/hello. You should get an error complaining that your querystring is invalid.`
  )
})
