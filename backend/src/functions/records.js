const { app } = require('@azure/functions');
const { getPool, sql } = require('../db');

function isGuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

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

app.http('getRecordById', {
  methods: ['GET'],
  route: 'records/{id}',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!isGuid(id)) {
        return {
          status: 404,
          jsonBody: { error: 'Record not found' },
        };
      }
      const pool = await getPool();
      const result = await pool
        .request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM records WHERE id = @id');
      if (result.recordset.length === 0) {
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

function isValidPhoneNumber(value) {
  if (value == null) {
    return true;
  }
  return /^\+[0-9]{9,50}$/.test(value);
}

function IsValidEmail(value) {
  return /^[a-żA-Ż0-9]+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(value);
}
function IsValidPurpose(value) {
  if (value == null) {
    return false;
  }
  return /^[a-żA-Ż0-9\s]{2,500}$/.test(value);
}
function IsValidName(value) {
  if (value == null) {
    return false;
  }
  return /^[a-żA-Ż\s]{2,255}$/.test(value);
}

function validation(b) {
  if (
    !IsValidEmail(b.email) ||
    !IsValidName(b.name) ||
    !isValidPhoneNumber(b.phone) ||
    !IsValidPurpose(b.purpose)
  ) {
    return false;
  }
  return true;
}
app.http('createRecord', {
  methods: ['POST'],
  route: 'records',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      // TODO: add validation
      // - name: required, max 255 chars
      // - email: required, valid format
      // - purpose: required, max 500 chars
      // - phone: optional, max 50 chars
      // return 400 with { error: '...' } if invalid
      if (!validation(body)) {
        return {
          status: 400,
          jsonBody: { error: 'failed verification' },
        };
      }
      return {
        status: 200,
        jsonBody: { error: 'passed verification' },
      };
      const { name, email, phone, purpose } = body;

      const pool = await getPool();
      const result = await pool
        .request()
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .input('phone', sql.NVarChar(50), phone || null)
        .input('purpose', sql.NVarChar(500), purpose).query(`
          INSERT INTO records (name, email, phone, purpose)
          OUTPUT INSERTED.*
          VALUES (@name, @email, @phone, @purpose)
        `);

      return {
        status: 201,
        jsonBody: { data: result.recordset[0] },
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

app.http('updateRecord', {
  methods: ['POST'],
  route: 'records/{id}',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!isGuid(id)) {
        return {
          status: 404,
          jsonBody: { error: 'Record not found' },
        };
      }
      const body = await request.json();
      // TODO: add validation
      // - name: required, max 255 chars
      // - email: required, valid format
      // - purpose: required, max 500 chars
      // - phone: optional, max 50 chars
      // return 400 with { error: '...' } if invalid
      if (!validation(body)) {
        return {
          status: 400,
          jsonBody: { error: 'failed verification' },
        };
      }
      const { name, email, phone, purpose } = body;

      const pool = await getPool();
      const result = await pool
        .request()
        .input('id', sql.UniqueIdentifier, id)
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .input('phone', sql.NVarChar(50), phone || null)
        .input('purpose', sql.NVarChar(500), purpose).query(`
          UPDATE records
          SET name = @name, email = @email, phone = @phone, purpose = @purpose
          OUTPUT inserted.*
          WHERE id = @id`);

      return {
        status: 201,
        jsonBody: { data: result.recordset[0] },
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
