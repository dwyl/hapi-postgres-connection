const test = require('tape');
const { init } = require('./server');

(async () => {
  const server = await init();

  test('GET /logs as fast as you can!', async function (t) {
    const response = await server.inject('/logs');
    t.equal(response.statusCode, 200, '/logs visited');
    t.end();
  });
  
  test('GET /logs try it again!', async function (t) {
    const response = await server.inject('/logs');
    t.equal(response.statusCode, 200, '/logs visited');
    t.end();
  });

  test.onFinish(() => {
    process.exit();
  });
})();

