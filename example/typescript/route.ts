import * as Joi from '@hapi/joi'
import {
  ValidatedRequest,
  ValidatedRequestSchema,
  createValidator,
  ContainerTypes
} from '../../express-joi-validation'
import { Router } from 'express'
import 'joi-extract-type'

const route = Router()
const validator = createValidator()
const querySchema = Joi.object({
  name: Joi.string().required()
})

interface HelloRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: Joi.extractType<typeof querySchema>
}

route.get('/hello', validator.query(querySchema), (req, res) => {
  const vreq = req as ValidatedRequest<HelloRequestSchema>

  res.end(`Hello ${vreq.query.name}`)
})

export default route
