'use strict'

const port = 3030

import express from 'express'
import * as Joi from 'joi'
import HelloWorld from './route'
import { createValidator, ExpressJoiError } from '../../express-joi-validation'

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

// Custom error handler
app.use(
  (
    err: any | ExpressJoiError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err && err.error && err.error.isJoi) {
      const e: ExpressJoiError = err
      // e.g "you submitted a bad query"
      res.status(400).end(`You submitted a bad ${e.type} paramater.`)
    } else {
      res.status(500).end('internal server error')
    }
  }
)

app.listen(port, () => {
  console.log(`\napp started on ${port}\n`)
  console.log(
    `Try accessing http://localhost:${port}/ping or http://localhost:${port}/hello?name=dean to get some data.\n`
  )
  console.log(
    `Now try access http://localhost:${port}/hello. You should get an error complaining that your querystring is invalid.`
  )
})
