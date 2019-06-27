import * as Joi from '@hapi/joi';
import * as express from 'express'
import { IncomingHttpHeaders } from 'http';

export function createValidator (cfg? : ExpressJoiConfig): ExpressJoiInstance

export interface ValidatedRequest<T extends ValidatedRequestSchema> extends express.Request {
  body: T['body']
  query: T['query']
  headers: T['headers']
  params: T['params']
  fields: T['fields']
  originalBody: any
  originalQuery: any
  originalHeaders: IncomingHttpHeaders
  originalParams: any
  originalFields: any
}

export interface ValidatedRequestSchema {
  body?: any
  query?: any
  headers?: any
  params?: any
  fields?: any
}

export interface ExpressJoiConfig {
  joi?: typeof Joi
  statusCode?: number
  passError?: boolean
}

export interface ExpressJoiContainerConfig {
  joi?: Joi.ValidationOptions
  statusCode?: number
  passError?: boolean
}

export interface ExpressJoiInstance {
  body (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  query (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  params (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  headers (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  fields (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
  response (schema: Joi.Schema, cfg?: ExpressJoiContainerConfig): express.RequestHandler
}
