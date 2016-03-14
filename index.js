var pg = require('pg');
var assert = require('assert');
var internals = {};
var pkg = require('./package.json');

exports.register = function(server, options, next) {
  // if DATABASE_URL Environment Variable is unset halt the server.start
  assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');
  // yes, this creates multiple connections, but aparently, that's OK...
  var CON = [], run_once = false;

  server.ext('onPreAuth', function (request, reply) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      assert(!err, pkg.name + 'ERROR Connecting')
      server.log(['info', pkg.name], 'DB Connection Active');
      CON.push({ client: client, done: done});
      request.pg = {
        client: client,
        done: done
      }
      // each connection created is shut down when the server stops (e.g tests)
      if(!run_once) {
        run_once = true;
        server.on('stop', function () { // only one server.on('stop') listener
          CON.forEach(function (con) { // close all the connections
            con.client.end();
            con.done();
          })
          server.log(['info', pkg.name], 'DB Connection Closed');
        });
      }
      reply.continue();
    });
  });

  next();
};

exports.register.attributes = {
  pkg: pkg
};
