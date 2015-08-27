module.exports = createApp;

var express = require('express');
var session = require('express-session');
var uuid = require('node-uuid');
var Ldp = require('ldp');
var rdf = require('rdf-ext')();

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
    // requestIri: function (req) {
    //   var url = 'http://solid.tld' + req.url
    //   var host = req.protocol
    //   if (req.host)
    // }
  });

  app.locals.solid = solid;

  if (solid.webid) {
    app.use(session({
      secret: ldp.secret || uuid.v1(),
      saveUninitialized: false,
      resave: false
    }));
  }

  if (solid.proxy) {
    proxy(app, solid.proxy);
  }

  if (solid.live) {
    // ws(app);
  }

  // Setting up routes
  app.use('/', cors, ldp.middleware);

  return app;
}
