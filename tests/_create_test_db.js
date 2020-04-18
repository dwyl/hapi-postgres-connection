var test = require('tape');
// we display the file (name) in each test name for stack trace
var dir = __dirname.split('/')[__dirname.split('/').length-1];
var file = dir + __filename.replace(__dirname, '') + ' -> ';

var pg = require('pg');
var assert = require('assert');

console.log('process.env.DATABASE_URL', process.env.DATABASE_URL)

function create_tables (callback) {
  var pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
  pool.connect( function(err, client) {
    assert(!err); // if db connection fails then EXPLODE!!
    var file = require('path').resolve(__dirname + '/test_db_setup.sql');
    var query = require('fs').readFileSync(file, 'utf8').toString();
    // console.log('\n', query);
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      client.end();
      return callback(err, result);
    });
  });
}

test('Create "users" table in test database', function (t) {
  create_tables(function (err, data) {
    t.equal(data[data.length-1].command, 'INSERT', 'DB Table Created & Test Data Inserted');
    t.end();
  })
});
