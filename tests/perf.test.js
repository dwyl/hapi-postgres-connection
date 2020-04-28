const test = require('tape');
const { init } = require('./server');
const decache = require('decache');
// delete the cached module:
decache('../index.js');
const HapiPostgresConnection = require('../index.js');

(async () => {
  const server = await init();

  await server.register({
    plugin: HapiPostgresConnection
  });

  test('GET /nopg url that do not make any postgres queires', async function (t) {
    const nopg = { method: 'GET', url: '/nopg' };

    const request_total = 5;
    for(let request_count = 0; request_count < request_total; request_count++) {
      const response = await server.inject(nopg);
      t.equal(response.statusCode, 200, `/nopg visited ${request_count}`);
    }
    t.end();
  });

  test('POST /insert 1k times to simulate many concurent hits to same endpoint', async function(t){
    const insert = {
      method: 'POST',
      url: '/insert',
      payload: { message: 'Ground control to major Tom.'}
    }

    const request_total = 1000;
    const start_time = Date.now();
    for(let request_count = 0; request_count < request_total; request_count++) {
      console.log('request_count', request_count)
      const response = await server.inject(insert);
      t.equal(response.statusCode, 200, 'Find Person in Database');
      t.ok(response.result['log_id'] > 1, `Read log entry ${request_count}`);
    }

    (function logTime() {
      const end_time = Date.now();
      const time_taken = end_time - start_time;
      const per_sec = request_total/(time_taken/1000);
      console.log('Time Taken:', time_taken, 'ms | Requests per second:', per_sec);
      t.end();
    })()
  });

  test.onFinish(async () => {
    await server.stop();
    process.exit();
  });
})();
