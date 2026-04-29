const sql = require('mssql');

let pool = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(process.env.DB_CONNECTION_STRING);
    }
    return pool;
}

module.exports = { getPool, sql };