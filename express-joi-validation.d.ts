import * as Joi from 'joi';
import * as express from 'express'

declare module 'express' {
  interface Request {
    originalBody: Array<any>|object|undefined
    originalQuery: object
    originalHeaders: object
    originalParams: object
    originalFields: object
  }
}

interface ExpressJoiConfig {
  joi?: typeof Joi
  statusCode?: number
  passError?: boolean
}

interface ExpressJoiContainerConfig {
  joi?: Joi.ValidationOptions
  statusCode?: number
  passError?: boolean
}

interface ExpressJoiInstance {
  body (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  query (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  params (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  headers (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  fields (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
}

declare function validation (cfg? : ExpressJoiConfig): ExpressJoiInstance

declare namespace validation {}

export = validation
