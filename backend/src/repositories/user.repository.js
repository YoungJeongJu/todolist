import pool from '../db/pool.js';

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password, name, theme_mode AS "themeMode", created_at AS "createdAt" FROM "user" WHERE email = $1',
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, name, theme_mode AS "themeMode", created_at AS "createdAt" FROM "user" WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function createUser({ email, password, name }) {
  const { rows } = await pool.query(
    'INSERT INTO "user" (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, theme_mode AS "themeMode", created_at AS "createdAt"',
    [email, password, name]
  );
  return rows[0];
}

export async function updateUser(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;
  if (fields.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(fields.name); }
  if (fields.password !== undefined) { setClauses.push(`password = $${idx++}`); values.push(fields.password); }
  if (fields.themeMode !== undefined) { setClauses.push(`theme_mode = $${idx++}`); values.push(fields.themeMode); }
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE "user" SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, email, name, theme_mode AS "themeMode", created_at AS "createdAt"`,
    values
  );
  return rows[0];
}

export async function deleteUser(id) {
  await pool.query('DELETE FROM "user" WHERE id = $1', [id]);
}
