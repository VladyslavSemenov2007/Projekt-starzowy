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
      const limit = parseInt(request.query.get('limit')) || 30;
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
          status: 400,
          jsonBody: { error: 'Uid is not valid' },
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
  return /^[a-żA-Ż0-9._-]+\@[a-zA-Z0-9._-]+\.[a-zA-Z-9._-]{2,}$/.test(value);
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
  const errors = [];
  if (!IsValidEmail(b.email)) {
    errors.push('email: invalid or missing ');
  }
  if (!IsValidName(b.name)) {
    errors.push('name: invalid or missing (length 2-255)');
  }
  if (!isValidPhoneNumber(b.phone)) {
    errors.push('phone: invalid (starts with +,numbers length 9-50)');
  }
  if (!IsValidPurpose(b.purpose)) {
    errors.push('purpose: invalid or missing (length 2-500)');
  }
  return errors;
}
app.http('createRecord', {
  methods: ['POST'],
  route: 'records',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      // TODO: add validation
      const errors = validation(body);
      if (errors.length > 0) {
        return {
          status: 400,
          jsonBody: errors,
        };
      }
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
          VALUES (@name, @email, @phone, @purpose)`);
      if (result.recordset.length === 0) {
        return {
          status: 404,
          jsonBody: { error: 'Record not found' },
        };
      }

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
  methods: ['PUT'],
  route: 'records/{id}',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!isGuid(id)) {
        return {
          status: 400,
          jsonBody: { error: 'UID is not valid' },
        };
      }
      const body = await request.json();
      ///     !IsValidEmail(b.email) ||!IsValidName(b.name) ||!isValidPhoneNumber(b.phone) ||!IsValidPurpose(b.purpose);
      const errors = validation(body);
      if (errors.length > 0) {
        return {
          status: 400,
          jsonBody: errors,
        };
      }
      const { name, email, phone, purpose } = body;

      const pool = await getPool();
      const check = await pool
        .request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM records WHERE id = @id');
      if (check.recordset.length === 0) {
        return {
          status: 404,
          jsonBody: { error: 'Record not found' },
        };
      }
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

app.http('DeleteRecord', {
  methods: ['DELETE'],
  route: 'records/{id}',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      if (!isGuid(id)) {
        return {
          status: 400,
          jsonBody: { error: 'UID is not valid' },
        };
      }
      const pool = await getPool();
      const check = await pool
        .request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM records WHERE id = @id');
      if (check.recordset.length === 0) {
        return {
          status: 404,
          jsonBody: { error: 'Record not found' },
        };
      }
      const result = await pool.request().input('id', sql.UniqueIdentifier, id)
        .query(`
          DELETE FROM records
          OUTPUT deleted.*
          WHERE id = @id`);

      return {
        status: 201,
        jsonBody: { status: 'ok' },
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
