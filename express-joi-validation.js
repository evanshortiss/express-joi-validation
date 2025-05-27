'use strict'

// These represent the incoming data containers that we might need to validate
const containers = {
  query: {
    storageProperty: 'originalQuery',
    joi: {
      convert: true,
      allowUnknown: false,
      abortEarly: false
    }
  },
  // For use with body-parser
  body: {
    storageProperty: 'originalBody',
    joi: {
      convert: true,
      allowUnknown: false,
      abortEarly: false
    }
  },
  headers: {
    storageProperty: 'originalHeaders',
    joi: {
      convert: true,
      allowUnknown: true,
      stripUnknown: false,
      abortEarly: false
    }
  },
  // URL params e.g "/users/:userId"
  params: {
    storageProperty: 'originalParams',
    joi: {
      convert: true,
      allowUnknown: false,
      abortEarly: false
    }
  },
  // For use with express-formidable or similar POST body parser for forms
  fields: {
    storageProperty: 'originalFields',
    joi: {
      convert: true,
      allowUnknown: false,
      abortEarly: false
    }
  }
}

function buildErrorString(err, container) {
  let ret = `Error validating ${container}.`
  let details = err.error.details

  for (let i = 0; i < details.length; i++) {
    ret += ` ${details[i].message}.`
  }

  return ret
}

module.exports.createValidator = function generateJoiMiddlewareInstance(cfg) {
  cfg = cfg || {} // default to an empty config
  // We'll return this instance of the middleware
  const instance = {
    response
  }

  Object.keys(containers).forEach(type => {
    // e.g the "body" or "query" from above
    const container = containers[type]

    instance[type] = function(schema, opts) {
      opts = opts || {} // like config, default to empty object
      const computedOpts = { ...container.joi, ...cfg.joi, ...opts.joi }
      return function expressJoiValidator(req, res, next) {
        const ret = schema.validate(req[type], computedOpts)

        if (!ret.error) {
          req[container.storageProperty] = req[type]
          const descriptor = Object.getOwnPropertyDescriptor(req, type)
          if (descriptor && descriptor.writable) {
            req[type] = ret.value
          } else {
            Object.defineProperty(req, type, {
              get() {
                return ret.value
              }
            })
          }
          next()
        } else if (opts.passError || cfg.passError) {
          ret.type = type
          next(ret)
        } else {
          res
            .status(opts.statusCode || cfg.statusCode || 400)
            .end(buildErrorString(ret, `request ${type}`))
        }
      }
    }
  })

  return instance

  function response(schema, opts = {}) {
    const type = 'response'
    return (req, res, next) => {
      const resJson = res.json.bind(res)
      res.json = validateJson
      next()

      function validateJson(json) {
        const ret = schema.validate(json, opts.joi)
        const { error, value } = ret
        if (!error) {
          // return res.json ret to retain express compatibility
          return resJson(value)
        } else if (opts.passError || cfg.passError) {
          ret.type = type
          next(ret)
        } else {
          res
            .status(opts.statusCode || cfg.statusCode || 500)
            .end(buildErrorString(ret, `${type} json`))
        }
      }
    }
  }
}
