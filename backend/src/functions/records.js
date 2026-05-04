const { app } = require('@azure/functions');
const { getPool, sql } = require('../db');

app.http('records', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      console.log(request.query); //delete
      const page = parseInt(request.query.get('page')) || 1;
      const limit = parseInt(request.query.get('limit')) || 10;
      const offset = (page - 1) * limit;

      const pool = await getPool();

      const result = await pool
        .request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit).query(`
          SELECT * FROM records
            ORDER BY created_at
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`);

      const totalResult = await pool
        .request()
        .query('SELECT COUNT(*) as count FROM records');
      const total = totalResult.recordset[0].count;

      return {
        status: 200,
        jsonBody: {
          data: result.recordset,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      context.log(error);
      return {
        status: 500,
        jsonBody: { error: 'internal error' },
      };
    }
  },
});
