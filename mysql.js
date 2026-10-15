require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err.message);
  } else {
    console.log('Conectado ao MySQL!');
    conn.release();
  }
});

module.exports = pool;