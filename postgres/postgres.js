const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.postgresql_user,
  host: process.env.postgresql_host,
  database: process.env.postgresql_database,
  password: process.env.postgresql_password,
  port: process.env.postgresql_port,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

module.exports = pool;
