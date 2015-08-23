module.exports = createApp;

var express = require('express');
var session = require('express-session');
var uuid = require('node-uuid');
var Ldp = require('ldp');
var rdf = require('rdf-ext');

var Solid = require('./solid');
var debug = require('./debug');

var proxy = require('./handlers/proxy');
var cors = require('./cors');

function createApp (argv) {
  var app = express();

  // Setting Solid as ldp variable in Express app
  var solid = new Solid(argv);

  // Setting Ldp
  var ldp = new Ldp(rdf, solid.store, {
    log: debug.ldp
    // TODO
  });

  app.locals.solid = ldp;

  if (ldp.webid) {
    app.use(session({
      secret: ldp.secret || uuid.v1(),
      saveUninitialized: false,
      resave: false
    }));
  }

  if (ldp.proxy) {
    proxy(app, ldp.proxy);
  }

  if (ldp.live) {
    // ws(app);
  }

  // Setting up routes
  app.use('/', cors, ldp.middleware);

  return app;
}
