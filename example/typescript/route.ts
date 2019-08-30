import * as Joi from '@hapi/joi'
import formidable from 'express-formidable'
import {
  ValidatedRequest,
  ValidatedRequestWithRawInputsAndFields,
  ValidatedRequestSchema,
  createValidator,
  ContainerTypes
} from '../../express-joi-validation'
import { Router } from 'express'
import 'joi-extract-type'

const route = Router()
const validator = createValidator()
const schema = Joi.object({
  name: Joi.string().required()
})

interface HelloGetRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: Joi.extractType<typeof schema>
}

interface HelloPostRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Fields]: Joi.extractType<typeof schema>
}

// curl http://localhost:3030/hello/?name=express
route.get(
  '/',
  validator.query(schema),
  (req: ValidatedRequest<HelloGetRequestSchema>, res) => {
    res.end(`Hello ${req.query.name}`)
  }
)

// curl -X POST -F 'name=express' http://localhost:3030/hello
route.post('/', formidable(), validator.fields(schema), (req, res) => {
  const vreq = req as ValidatedRequestWithRawInputsAndFields<
    HelloPostRequestSchema
  >

  res.end(`Hello ${vreq.fields.name}`)
})

export default route
