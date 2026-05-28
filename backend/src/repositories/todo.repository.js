import pool from '../db/pool.js';

export async function findTodosByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id AS "userId", category_id AS "categoryId",
            title, description, start_date AS "startDate", due_date AS "dueDate",
            status, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM todo WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function findTodoById(id) {
  const { rows } = await pool.query(
    `SELECT id, user_id AS "userId", category_id AS "categoryId",
            title, description, start_date AS "startDate", due_date AS "dueDate",
            status, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM todo WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createTodo({ userId, categoryId, title, description, startDate, dueDate }) {
  const { rows } = await pool.query(
    `INSERT INTO todo (user_id, category_id, title, description, start_date, due_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id AS "userId", category_id AS "categoryId",
               title, description, start_date AS "startDate", due_date AS "dueDate",
               status, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [userId, categoryId, title, description ?? null, startDate ?? null, dueDate ?? null]
  );
  return rows[0];
}

export async function updateTodo(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;
  if (fields.title !== undefined)       { setClauses.push(`title = $${idx++}`);       values.push(fields.title); }
  if (fields.description !== undefined) { setClauses.push(`description = $${idx++}`); values.push(fields.description); }
  if (fields.startDate !== undefined)   { setClauses.push(`start_date = $${idx++}`);  values.push(fields.startDate); }
  if (fields.dueDate !== undefined)     { setClauses.push(`due_date = $${idx++}`);    values.push(fields.dueDate); }
  if (fields.categoryId !== undefined)  { setClauses.push(`category_id = $${idx++}`); values.push(fields.categoryId); }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE todo SET ${setClauses.join(', ')} WHERE id = $${idx}
     RETURNING id, user_id AS "userId", category_id AS "categoryId",
               title, description, start_date AS "startDate", due_date AS "dueDate",
               status, created_at AS "createdAt", updated_at AS "updatedAt"`,
    values
  );
  return rows[0];
}

export async function updateTodoStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE todo SET status = $1 WHERE id = $2
     RETURNING id, user_id AS "userId", category_id AS "categoryId",
               title, description, start_date AS "startDate", due_date AS "dueDate",
               status, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [status, id]
  );
  return rows[0];
}

export async function deleteTodo(id) {
  await pool.query('DELETE FROM todo WHERE id = $1', [id]);
}

export async function findTodosByFilter(userId, { status, categoryId }) {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;
  const today = new Date().toISOString().slice(0, 10);

  if (status === 'OVERDUE') {
    conditions.push(`due_date < $${idx++}`);
    conditions.push(`status != 'DONE'`);
    values.push(today);
  } else if (status === 'DONE') {
    conditions.push(`status = 'DONE'`);
  } else if (status === 'NOT_STARTED' || status === 'IN_PROGRESS') {
    conditions.push(`status = $${idx++}`);
    conditions.push(`(due_date >= $${idx++} OR due_date IS NULL)`);
    values.push(status, today);
  }

  if (categoryId) {
    conditions.push(`category_id = $${idx++}`);
    values.push(categoryId);
  }

  const sql = `SELECT id, user_id AS "userId", category_id AS "categoryId",
                      title, description, start_date AS "startDate", due_date AS "dueDate",
                      status, created_at AS "createdAt", updated_at AS "updatedAt"
               FROM todo WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const { rows } = await pool.query(sql, values);
  return rows;
}
