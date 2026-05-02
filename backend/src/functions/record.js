const { app } = require('@azure/functions');
const { getPool } = require('../db');

app.http('records', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const pool = await getPool();
            const result = await pool.request().query('SELECT * from records');

            return {
                status: 200,
                jsonBody: { status: result, db: 'connected', message: result.recordset}
            };
        } catch (error) {
            return {
                status: 500,
                jsonBody: { status: 'not ok', db: 'error', message: error.message }
            };
        }
    }
});