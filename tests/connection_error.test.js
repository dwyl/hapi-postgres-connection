const test = require('tape');
const decache = require('decache');

(async () => {
  test('Test prolem with DB connect', async function (t) {
    process.env.DATABASE_URL = 'incorrect DB credentials';
    const { init } = require('./server');

    const insert = {
      method: 'POST',
      url: '/insert',
      payload: { message: 'Ground control to major Tom.'}
    }

    try {
      const server = await init();
      // delete the cached module:
      decache('../index.js');
      const HapiPostgresConnection = require('../index.js');

      await server.register({
        plugin: HapiPostgresConnection
      });
      const response = await server.inject(insert);
      
      t.equal(response.statusCode, 500, 'request failed - it is correct here');
      await server.stop();

      t.end();
    } catch (e) {
      console.log(e);
    }
  });

  test.onFinish(() => {
    process.exit();
  });
})();

