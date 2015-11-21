module.exports = middlewares

var string = require('string')
var path = require('path')
var express = require('express')
var getRawBody = require('raw-body')
var login = require('./handlers/login')
var responseTime = require('response-time')

function middlewares (corsSettings) {
  var router = express.Router()
  router.use(linksHandler)
  if (corsSettings) router.use(corsSettings)
  router.use(rawBodyHandler)
  router.use(login)
  router.use(responseTime())
  return router
}

function basename (fullpath) {
  var bname = ''
  if (fullpath &&
    fullpath.lastIndexOf('/') !== fullpath.length - 1) {
    bname = path.basename(fullpath)
  }
  return bname
}

function linksHandler (req, res, next) {
  var solid = req.app.locals.solid
  var links = []

  // Can't access .meta files directly
  if (string(req.originalUrl).endsWith(solid.suffixMeta)) {
    var err = new Error('Trying to access metadata file as a regular file')
    err.status = 404
    return next(err)
  }

  links.push('<http://www.w3.org/ns/ldp#Resource>; rel="type"')
  if (string(req.originalUrl).endsWith('/')) {
    links.push('<http://www.w3.org/ns/ldp#Container>; rel="type"')
    links.push('<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"')
  }
  var base = basename(req.path)
  links.push('<' + path.join(base, solid.suffixAcl) + '>; rel="acl"')
  links.push('<' + path.join(base, solid.suffixMeta) + '>; rel="describedBy"')
  res.set('Link', links.join(', '))
  next()
}

function rawBodyHandler (req, res, next) {
  // TODO
  var settings = {
    length: req.headers['content-length'],
    encoding: 'utf-8'
  }
  getRawBody(req, settings, function (err, string) {
    req.text = string
    next(err)
  })
}
