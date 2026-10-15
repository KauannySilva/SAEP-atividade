require('dotenv').config();

const mysql = require('mysql2');

const connectionUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PRIVATE_URL;

const connectionOptions = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3307),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password:
        process.env.DB_PASSWORD ||
        process.env.MYSQLPASSWORD ||
        process.env.MYSQL_ROOT_PASSWORD ||
        '',
    database:
        process.env.DB_NAME ||
        process.env.MYSQLDATABASE ||
        process.env.MYSQL_DATABASE ||
        'vw_estoque',
    connectTimeout: 10000
};

const connection = connectionUrl
    ? mysql.createConnection(connectionUrl)
    : mysql.createConnection(connectionOptions);

function stopWithConnectionError(err) {
    console.error('\n[MySQL] Não foi possível conectar ao banco.');
    console.error(`[MySQL] Código: ${err.code || 'não informado'}`);
    console.error(`[MySQL] Detalhe: ${err.message}`);

    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        console.error('[MySQL] Confira o host e a porta. No Railway, use uma referência de variável do serviço MySQL; não use localhost para conectar a outro serviço.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('[MySQL] Confira usuário e senha configurados nas variáveis do serviço da aplicação.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
        console.error('[MySQL] O banco indicado na URL ou em DB_NAME/MYSQLDATABASE não existe.');
    }

    console.error('[MySQL] Não será possível iniciar a API sem uma conexão válida.');
    process.exit(1);
}

connection.connect((err) => {
    if (err) {
        stopWithConnectionError(err);
        return;
    }

    connection.query('SELECT 1 AS connection_test', (testError, rows) => {
        if (testError) {
            stopWithConnectionError(testError);
            return;
        }

        console.log(`[MySQL] Conexão estabelecida; SELECT 1 retornou ${rows[0].connection_test}.`);
    });
});

module.exports = connection;
