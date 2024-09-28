// lib /db.js

import {Pool} from 'pg'

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

export const queryDatabase = async (queryText, params) => {
    const client = await pool.connect();
    try {
      const res = await client.query(queryText, params); //not necessarily params
      return res.rows;
    } finally {
      client.release();
    }
  };