// lib /db.js

import {Pool} from 'pg'

const pool = new Pool({
    user:'',
    host:'',
    database:'',
    password:'',
    port:'',
})

export const queryDatabase = async (queryText, params) => {
    const client = await pool.connect();
    try {
      const res = await client.query(queryText, params); //not necessarily params
      return res.rows;
    } finally {
      client.release();
    }
  };