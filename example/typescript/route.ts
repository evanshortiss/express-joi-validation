import * as Joi from 'joi'
import formidable from 'express-formidable'
import {
  ValidatedRequest,
  ValidatedRequestWithRawInputsAndFields,
  ValidatedRequestSchema,
  createValidator,
  ContainerTypes
} from '../../express-joi-validation'
import { Router } from 'express'

const route = Router()
const validator = createValidator()
const schema = Joi.object({
  name: Joi.string().required()
})

interface HelloGetRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: {
    name: string
  }
}

interface HelloPostRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Fields]: {
    name: string
  }
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
  const vreq = (req as unknown) as ValidatedRequestWithRawInputsAndFields<
    HelloPostRequestSchema
  >

  res.end(`Hello ${vreq.fields.name}`)
})

export default route
