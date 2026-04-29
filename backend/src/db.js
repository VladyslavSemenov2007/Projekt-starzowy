const sql = require('mssql');

const config = {
    connectionString: process.env.DB_CONNECTION_STRING
};

let pool = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

module.exports = { getPool, sql };