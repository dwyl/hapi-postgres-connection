"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var assert = require('assert'); // if DATABASE_URL Environment Variable is unset halt the server.start


assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');

var pg = require('pg');

var pkg = require('../package.json');

var PG_CON = []; // this "global" is local to the plugin.

var run_once = false; // create a pool

var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL || false
}); // connection using created pool

_asyncToGenerator(function* () {
  try {
    var client = yield pool.connect();
    PG_CON.push({
      client
    });
    return;
  } catch (err) {
    assert(!err, pkg.name + 'ERROR Connecting to PostgreSQL!');
  }
})();

function assign_connection(request, h) {
  // DRY
  request.pg = module.exports.getCon();
  return h.continue;
}

var HapiPostgresConnection = {
  pkg,
  name: 'HapiPostgresConnection',
  version: '1.0.0',
  register: function () {
    var _register = _asyncToGenerator(function* (server, options) {
      server.ext({
        type: 'onPreAuth',
        method: function () {
          var _method = _asyncToGenerator(function* (request, h) {
            // each connection created is shut down when the server stops (e.g tests)
            if (!run_once && !PG_CON.length) {
              run_once = true;
              server.events.on('stop', function () {
                // only one server.on('stop') listener
                PG_CON.forEach( /*#__PURE__*/function () {
                  var _ref2 = _asyncToGenerator(function* (con) {
                    // close all the connections
                    yield con.client.end();
                  });

                  return function (_x5) {
                    return _ref2.apply(this, arguments);
                  };
                }());
                server.log(['info', pkg.name], 'DB Connection Closed');
              });
            }

            if (PG_CON.length === 0) {
              try {
                var client = yield pool.connect();
                PG_CON.push({
                  client: client
                });
                return assign_connection(request, h);
              } catch (err) {
                assert(!err, +"".concat(pkg.name, " ERROR Connecting to PostgreSQL!"));
              }
            } else {
              return assign_connection(request, h);
            }

            return h.continue;
          });

          function method(_x3, _x4) {
            return _method.apply(this, arguments);
          }

          return method;
        }()
      });
    });

    function register(_x, _x2) {
      return _register.apply(this, arguments);
    }

    return register;
  }()
};
module.exports = HapiPostgresConnection;

module.exports.getCon = function () {
  return PG_CON[0];
};