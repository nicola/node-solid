// Expose solid() and solid.createServer()
var solid = require('./lib/create-app');
solid.createServer = require('./lib/create-server');

module.exports = solid;
