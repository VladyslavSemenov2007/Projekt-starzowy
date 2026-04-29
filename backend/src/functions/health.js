const { app } = require('@azure/functions');
const { getPool } = require('../db');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const pool = await getPool();
            await pool.request().query('SELECT 1');
            return {
                status: 200,
                jsonBody: { status: 'ok', db: 'connected' }
            };
        } catch (error) {
            return {
                status: 500,
                jsonBody: { status: 'ok', db: 'error', message: error.message }
            };
        }
    }
});