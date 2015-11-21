module.exports = loginHandler

var webid = require('webid/tls')
var debug = require('../debug').login

function loginHandler (req, res, next) {
  var solid = req.app.locals.solid

  // No webid required? skip
  if (!solid.webid) {
    // setEmptySession(req)
    return next()
  }

  // User already logged in? skip
  if (req.session.agent && req.session.identified) {
    debug('User: ' + req.session.agent)
    res.set('User', req.session.agent)
    return next()
  }

  var certificate = req.connection.getPeerCertificate()
  // Certificate is empty? skip
  if (certificate === null || Object.keys(certificate).length === 0) {
    debug('No client certificate found in the request. Did the user click on a cert?')
    setEmptySession(req)
    return next()
  }

  // Verify webid
  webid.verify(certificate, function (err, result) {
    if (err) {
      debug('Error processing certificate: ' + err.message)
      setEmptySession(req)
      err.status = 403
      return next(err)
    }
    req.session.agent = result
    req.session.identified = true
    debug('Identified user: ' + req.session.agent)
    res.set('User', req.session.agent)
    return next()
  })
}

function setEmptySession (req) {
  req.session.agent = ''
  req.session.identified = false
}
