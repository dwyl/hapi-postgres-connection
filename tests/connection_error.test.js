const test = require('tape');
const decache = require('decache');
const escape = require('pg-escape');


(async () => {
  test('GET /logs as fast as you can!', async function (t) {
    // delete the cached module:
    decache('../index.js');
    const HapiPostgresConnection = require('../index.js');

    const { init } = require('./server');
    const server = await init();
    await server.register({
      plugin: HapiPostgresConnection
    });
    const response = await server.inject('/logs');
    await server.stop();
    t.equal(response.statusCode, 200, '/logs visited');
    t.end();
  });

  test('Test getCon function alone', async function (t) {
    // delete the cached module:
    decache('../index.js');
    const getCon = require('../index.js').getCon;

    const connection = await getCon();

    const message = 'Hello World!';
    const insertData = escape('INSERT INTO logs (message) VALUES (%L)', message);
    const queryData = 'SELECT * FROM logs ORDER BY log_timestamp DESC LIMIT 1;';

    await connection.client.query(insertData);

    const queryResult = await connection.client.query(queryData);

    t.equal(queryResult.command, 'SELECT', 'Received correct data');
    t.equal(queryResult.rowCount, 1, 'Received correct data');

    t.end();
  });

  test('Test incorrect DATABASE_URL env', async function (t) {
    // set incorrect env variable
    process.env.DATABASE_URL = 'incorrect DB credentials';

    // delete the cached module:
    decache('../index.js');
    const HapiPostgresConnection = require('../index.js');
    
    const { init } = require('./server');

    const server = await init();
    try {
      await server.register({
        plugin: HapiPostgresConnection
      });
    } catch (e) {
      await server.stop();
      t.error(!e, 'Plugin can\'t initialise - it is correct in this test');
      t.end();
    }
  });

  test.onFinish(() => {
    process.exit();
  });
})();

