'use strict'

const route = (module.exports = require('express').Router())
const users = require('./users')
const Joi = require('joi')
const _ = require('lodash')
const validator = require('../../').createValidator()

/**
 * This "GET /:id" endpoint is used to query users by their ID
 * Try accessing http://localhost:8080/users/1001 to see it in action.
 * Now try http://localhost:8080/users/bananas - it will fail since the ID must be an integer
 */
const paramsSchema = Joi.object({
  id: Joi.number().required()
})

route.get('/:id', validator.params(paramsSchema), (req, res) => {
  console.log(`\nGetting user by ID ${req.params.id}.`)
  console.log(
    `req.params was ${JSON.stringify(req.originalParams)} before validation`
  )
  console.log(`req.params is ${JSON.stringify(req.params)} after validation`)
  console.log('note that the ID was correctly cast to an integer')

  const u = _.find(users, { id: req.params.id })

  if (u) {
    res.json(u)
  } else {
    res.status(404).json({
      message: `no user exists with id "${req.params.id}"`
    })
  }
})

/**
 * This "GET /" endpoint is used to query users by a querystring
 * Try accessing http://localhost:8080/users?name=j&age=25 to get users that are 25 or with a name containing a "j".
 * Now try http://localhost:8080/users - it will fail since name is required
 */
const querySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .max(10),
  age: Joi.number()
    .integer()
    .min(1)
    .max(120)
})

route.get('/', validator.query(querySchema), (req, res) => {
  console.log(`\nGetting users for query ${JSON.stringify(req.query)}.`)
  console.log(
    `req.query was ${JSON.stringify(req.originalQuery)} before validation`
  )
  console.log(`req.query is ${JSON.stringify(req.query)} after validation`)
  console.log(
    'note that the age was correctly cast to an integer if provided\n'
  )

  res.json(
    _.filter(users, u => {
      return (
        _.includes(u.name, req.query.name) ||
        (req.query.age && u.age === req.query.age)
      )
    })
  )
})

/**
 * This "POST /" endpoint is used to create new users
 * POST to http://localhost:8080/users with '{"name": "jane", "age": "26"}' to see it work
 * Now try posting '{"name": "jane", "age": 1000}' - it will fail since the age is above 120
 */
const bodySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .max(10),
  age: Joi.number()
    .integer()
    .required()
    .min(1)
    .max(120)
})

route.post(
  '/',
  require('body-parser').json(),
  validator.body(bodySchema),
  (req, res) => {
    console.log(`\Creating user with data ${JSON.stringify(req.body)}.`)
    console.log(
      `req.body was ${JSON.stringify(req.originalBody)} before validation`
    )
    console.log(`req.body is ${JSON.stringify(req.body)} after validation`)
    console.log(
      'note that the age was correctly cast to an integer if it was a string\n'
    )

    // Generate data required for insert (new id is incremented from previous max)
    const prevMaxId = _.maxBy(users, u => u.id).id
    const data = Object.assign({}, req.body, { id: prevMaxId + 1 })

    users.push(data)

    res.json({ message: 'created user', data: data })
  }
)
