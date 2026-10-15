const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDb() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      multipleStatements: true,
    });

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(sql);
    console.log('Banco inicializado (tabelas criadas/verificadas).');
  } catch (err) {
    console.error('Erro ao inicializar o banco:', err.code, err.message);
  } finally {
    if (conn) await conn.end();
  }
}

module.exports = initDb;