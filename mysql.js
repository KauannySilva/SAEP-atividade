
const mysql = require('mysql2');

console.log('MYSQLHOST configurado:', Boolean(process.env.MYSQLHOST));
console.log('MYSQLPORT configurado:', Boolean(process.env.MYSQLPORT));

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'root',
    database: process.env.MYSQLDATABASE || 'vw_estoque',
    port: Number(process.env.MYSQLPORT || 3307)
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        return;
    }

    console.log('Conectado ao MySQL com sucesso!');
});

module.exports = connection;
