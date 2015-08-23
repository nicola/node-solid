module.exports = Solid;

var rdf = require('rdf-ext');
var LdpStore = require('rdf-store-ldp');
var FileStore = require('rdf-store-fs');
var ServerStore = require('rdf-store-server');
var AclStore = require('rdf-store-acl');

function Solid (argv) {
  var self = this;

  // Setting the RDF stores
  var stores = {
    local: argv.localStore || new FileStore(rdf),
    remote: argv.remoteStore || new LdpStore(rdf)
  };

  if (argv.webid) {
    stores.local = new AclStore(stores.local);
    stores.remote = new AclStore(stores.remote);
  }

  self.store = new ServerStore(stores);
}
