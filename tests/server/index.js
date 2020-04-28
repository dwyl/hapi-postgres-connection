const Hapi = require('@hapi/hapi');
const escape = require('pg-escape'); // https://github.com/segmentio/pg-escape

const serverPreparing = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: 'localhost',
    debug: {
      request: ['error']
    }
  });

  server.route({
    method: '*',
    path: '/',
    handler: async function (request, h) {

      const message = 'Hello World!';
      const insertData = escape('INSERT INTO logs (message) VALUES (%L)', message);
      const queryData = 'SELECT * FROM logs ORDER BY log_timestamp DESC LIMIT 1;';

      await request.pg.client.query(insertData);
      const queryResult = await request.pg.client.query(queryData);

      queryResultString = JSON.stringify(queryResult.rows[0]);
      return h.response(queryResultString);
    }
  });

  server.route({
    method: 'POST',
    path: '/insert',
    handler: async function (request, h) {
      const insertData = escape('INSERT INTO logs (message) VALUES (%L)', request.payload.message);
      const select = 'SELECT * FROM logs WHERE (log_id = 2)';

      await request.pg.client.query(insertData);
      const queryResult = await request.pg.client.query(select);
      return h.response(queryResult.rows[0]);
    }
  });

  server.route({
    method: 'GET',
    path: '/nopg',
    handler: async function (request, h) {
      // does not make any PG queries
      return h.response('ok');
    }
  });

  
  server.route({
    method: 'GET',
    path: '/logs',
    handler: async function(request, h) {
      var queryString = 'SELECT * FROM logs ORDER BY log_timestamp DESC LIMIT 1';

      try {
        const result = await request.pg.client.query(queryString);
        return h.response(result.rows[0]);
      } catch (err) {
        console.log(err);
      }
    }
  });

  return server;
};

exports.init = async () => {
  const server = await serverPreparing();
  await server.initialize();
  console.log('Server is initialized');
  return server;
};

exports.start = async () => {
  const server = await serverPreparing();
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};
