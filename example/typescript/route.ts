import * as Joi from '@hapi/joi'
import {
  ValidatedRequest,
  ValidatedRequestSchema,
  createValidator
} from '../../express-joi-validation'
import { Router } from 'express'
import 'joi-extract-type'

const route = Router()
const validator = createValidator()
const querySchema = Joi.object({
  name: Joi.string().required()
})

interface HelloRequestSchema extends ValidatedRequestSchema {
  query: Joi.extractType<typeof querySchema>
}

route.get(
  '/hello',
  validator.query(querySchema),
  (req: ValidatedRequest<HelloRequestSchema>, res) => {
    res.end(`Hello ${req.query.name}`)
  }
)

export = route
