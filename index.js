const assert = require('assert');
// if DATABASE_URL Environment Variable is unset halt the server.start
assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');

const pg = require('pg');
const pkg = require('./package.json');
const PG_CON = []; // this "global" is local to the plugin.
let run_once = false;

// create a pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL || false
});

const createPoolConnection = async () => {
  try {
    const client = await pool.connect();
    PG_CON.push({ client });
  } catch (err) {
    assert(!err, pkg.name + ' ERROR Connecting to PostgreSQL!');
  }
}

async function assign_connection (request, h) { // DRY
  request.pg = await module.exports.getCon();
  return h.continue;
}

const HapiPostgresConnection = {
  pkg,
  name: 'HapiPostgresConnection',
  version: '1.0.0',
  register: async function (server) {
    // connection using created pool
    await createPoolConnection();
    server.ext({
      type: 'onPreAuth',
      method: async function (request, h) {
        // each connection created is shut down when the server stops (e.g tests)
        if(!run_once) {
          run_once = true;
          server.events.on('stop', function () { // only one server.on('stop') listener
            PG_CON.forEach(async function (con) { // close all the connections
              await con.client.end();
            });
            server.log(['info', pkg.name], 'DB Connection Closed');
          });
        }
        return assign_connection(request, h);
      }
    });
  }
};

module.exports = HapiPostgresConnection;

module.exports.getCon = async function () {
  if (!PG_CON[0]) {
    await createPoolConnection();
    return PG_CON[0];
  }
  return PG_CON[0];
};
