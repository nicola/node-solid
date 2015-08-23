module.exports = addProxy;

var request = require('request');

var cors = require('../cors');
var debug = require('../debug');

function addProxy (app, path) {
  debug.settings('XSS Proxy listening to ' + path);
  app.get(path, cors, function (req, res) {
    debug.settings('originalUrl: ' + req.originalUrl);
    var uri = req.query.uri;
    if (!uri) {
      return res
        .status(400)
        .send('Proxy has no uri param ');
    }

    debug.settings('Proxy destination URI: ' + uri);
    request.get(uri).pipe(res);
  });
}
