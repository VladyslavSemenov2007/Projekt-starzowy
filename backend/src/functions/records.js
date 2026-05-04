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

/// druga wersja z id

app.http('records2', {
  methods: ['GET'],
  route: 'records/{id}', // Endpoint: /api/records/123
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!id) {
        return { status: 400, jsonBody: { error: 'ID is required' } };
      }

      const pool = await getPool();
      const result = await pool
        .request()
        .input('id', sql.VarChar, id)
        .query('SELECT * FROM records WHERE id = @id');

      if (!result.recordset || result.recordset.length === 0) {
        return {
          status: 404,
          jsonBody: { error: 'Record not found' },
        };
      }

      return {
        status: 200,
        jsonBody: { data: result.recordset[0] },
      };
    } catch (error) {
      context.log(`Error in records2: ${error.message}`);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' },
      };
    }
  },
});
