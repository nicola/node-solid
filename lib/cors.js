var cors = require('cors')

module.exports = cors({
  methods: [
    'OPTIONS', 'HEAD', 'GET',
    'PATCH', 'POST', 'PUT', 'DELETE'
  ],
  exposedHeaders: 'User, Location, Link, Vary, Last-Modified, Content-Length',
  credentials: true,
  maxAge: 1728000,
  origin: true
})
