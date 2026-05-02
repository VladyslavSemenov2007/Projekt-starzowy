const { app } = require('@azure/functions');
const { getPool } = require('../db');

const page = parseInt(req.query.get('page')) || 1;
const limit = parseInt(req.query.get('limit')) || 10;
const offset = (page - 1) * limit;

app.http('records', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const pool = await getPool();
            const result = await pool.request().query('SELECT * from records OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY');
            const total = await pool.request().query('SELECT count(*) from records');

            return {
                status: 200,
                jsonBody: { data: result.recordset, total: total, page:page, limit:limit }
            };
        } catch (error) {
            return {
                status: 500,
                jsonBody: { status: 'not ok', db: 'error', message: error.message }
            };
        }
    }
});