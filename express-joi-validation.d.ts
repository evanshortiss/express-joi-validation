import * as Joi from 'joi'
import * as express from 'express'
import { IncomingHttpHeaders } from 'http'
import { ParsedQs } from 'qs'

/**
 * Creates an instance of this module that can be used to generate middleware
 * @param cfg
 */
export function createValidator(cfg?: ExpressJoiConfig): ExpressJoiInstance

/**
 * These are the named properties on an express.Request that this module can
 * validate, e.g "body" or "query"
 */
export enum ContainerTypes {
  Body = 'body',
  Query = 'query',
  Headers = 'headers',
  Fields = 'fields',
  Params = 'params'
}

/**
 * Use this in you express error handler if you've set *passError* to true
 * when calling *createValidator*
 */
export interface ExpressJoiError extends Joi.ValidationResult {
  type: ContainerTypes
}

/**
 * A schema that developers should extend to strongly type the properties
 * (query, body, etc.) of incoming express.Request passed to a request handler.
 */
export type ValidatedRequestSchema = Record<ContainerTypes, any>

/**
 * Use this in conjunction with *ValidatedRequestSchema* instead of
 * express.Request for route handlers. This ensures *req.query*,
 * *req.body* and others are strongly typed using your
 * *ValidatedRequestSchema*
 */
export interface ValidatedRequest<T extends ValidatedRequestSchema>
  extends express.Request {
  body: T[ContainerTypes.Body]
  query: T[ContainerTypes.Query] & ParsedQs
  headers: T[ContainerTypes.Headers]
  params: T[ContainerTypes.Params]
}

/**
 * Use this in conjunction with *ValidatedRequestSchema* instead of
 * express.Request for route handlers. This ensures *req.query*,
 * *req.body* and others are strongly typed using your *ValidatedRequestSchema*
 *
 * This will also allow you to access the original body, params, etc. as they
 * were before validation.
 */
export interface ValidatedRequestWithRawInputsAndFields<
  T extends ValidatedRequestSchema
> extends express.Request {
  body: T[ContainerTypes.Body]
  query: T[ContainerTypes.Query]
  headers: T[ContainerTypes.Headers]
  params: T[ContainerTypes.Params]
  fields: T[ContainerTypes.Fields]
  originalBody: any
  originalQuery: any
  originalHeaders: IncomingHttpHeaders
  originalParams: any
  originalFields: any
}

/**
 * Configuration options supported by *createValidator(config)*
 */
export interface ExpressJoiConfig {
  statusCode?: number
  passError?: boolean
  joi?: object
}

/**
 * Configuration options supported by middleware, e.g *validator.body(config)*
 */
export interface ExpressJoiContainerConfig {
  joi?: Joi.ValidationOptions
  statusCode?: number
  passError?: boolean
}

/**
 * A validator instance that can be used to generate middleware. Is returned by
 * calling *createValidator*
 */
export interface ExpressJoiInstance {
  body(
    schema: Joi.Schema,
    cfg?: ExpressJoiContainerConfig
  ): express.RequestHandler
  query(
    schema: Joi.Schema,
    cfg?: ExpressJoiContainerConfig
  ): express.RequestHandler
  params(
    schema: Joi.Schema,
    cfg?: ExpressJoiContainerConfig
  ): express.RequestHandler
  headers(
    schema: Joi.Schema,
    cfg?: ExpressJoiContainerConfig
  ): express.RequestHandler
  fields(
    schema: Joi.Schema,
    cfg?: ExpressJoiContainerConfig
  ): express.RequestHandler
  response(
    schema: Joi.Schema,
    cfg?: ExpressJoiContainerConfig
  ): express.RequestHandler
}
