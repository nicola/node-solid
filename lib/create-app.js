module.exports = createApp

var express = require('express')
var session = require('express-session')
var uuid = require('node-uuid')
var Ldp = require('ldp')
var rdf = require('rdf-ext')
var blob = require('fs-blob-store')

var Solid = require('./solid')
var debug = require('./debug')

var proxy = require('./handlers/proxy')
var cors = require('./cors')
var middlewares = require('./middlewares')

function createApp (argv) {
  var solid = new Solid(argv)
  var app = express()
  app.locals.solid = solid

  // Setting Ldp
  var ldp = new Ldp(rdf, {
    graphStore: solid.store,
    blobStore: blob(solid.root),
    blobStoreOptions: {
      path: './',
      buildPath: function (p) {
        return p.pathname
      }
    },
    log: debug.ldp
  })

  if (solid.webid) {
    app.use(session({
      secret: solid.secret || uuid.v1(),
      saveUninitialized: false,
      resave: false
    }))
  }

  if (solid.proxy) {
    proxy(app, solid.proxy)
  }

  // Setting up routes
  app.use('/', middlewares(cors), ldp.middleware)

  return app
}
