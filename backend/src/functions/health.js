const { app } = require('@azure/functions');
const { getPool } = require('../db');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const pool = await getPool();
            const result = await pool.request().query('SELECT 1');
            return {
                status: 200,
                jsonBody: { status: "ok", db: 'connected',message: result.recordsets}
            };
        } catch (error) {
            return {
                status: 500,
                jsonBody: { status: 'not ok', db: 'error', message: error.message }
            };
        }
    }
});