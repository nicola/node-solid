module.exports = Solid;

var rdf = require('rdf-ext')();
var LdpStore = require('rdf-store-ldp');
var FileStore = require('rdf-store-fs');
var ServerStore = require('rdf-store-server');
var AclStore = require('rdf-store-acl');
var string = require('string');

var debug = require('./debug');

function Solid (argv) {
  var self = this;
  argv = argv || {};

  self.cache = argv.cache;
  self.live = argv.live;
  self.root = argv.root || process.cwd();
  // Add trailing /
  if (!(string(self.root).endsWith('/'))) {
    self.root += '/';
  }
  self.port = argv.port;
  self.secret = argv.secret;

  self.verbose = argv.verbose;
  self.webid = argv.webid;

  // Processed
  self.leavePatchConnectionOpen = false;
  self.suffixAcl = argv.suffixAcl || '.acl';
  self.suffixMeta = argv.suffixMeta || '.meta';
  self.suffixChanges = argv.suffixChanges || '.changes';
  self.suffixSSE = argv.suffixSSE || '.events';

  self.proxy = argv.proxy;

  // Cache of usedURIs
  self.usedURIs = {};
  self.SSEsubscriptions = {};
  self.subscriptions = {};

  // Error pages folder
  self.noErrorPages = argv.noErrorPages;
  if (!self.noErrorPages) {
    self.errorPages = argv.errorPages;
    if (!self.errorPages) {
      // For now disable error pages if errorPages parameter is not explicitly passed
      self.noErrorPages = true;
    } else if (!string(self.errorPages).endsWith('/')) {
      self.errorPages += '/';
    }
  }
  self.errorHandler = argv.errorHandler;

  // Setting the RDF stores
  var stores = {
    local: argv.localStore || new FileStore(rdf, {
      path: argv.root,
      graphFile: function (p) {
        return p.pathname;
      }
    }),
    remote: argv.remoteStore || new LdpStore(rdf)
  };

  self.store = new ServerStore(stores);

  if (argv.webid) {
    self.store = new AclStore(self.store)
  }

  debug.settings('root: ' + argv.root);
  debug.settings('URI path filter regexp: ' + self.pathFilter);
  debug.settings('Verbose: ' + !!self.verbose);
  debug.settings('WebID: ' + !!self.webid);
  debug.settings('Live: ' + !!self.live);
}
