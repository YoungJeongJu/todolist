import pool from '../db/pool.js';

export async function createDefaultCategory(userId) {
  const { rows } = await pool.query(
    'INSERT INTO category (user_id, name, is_default) VALUES ($1, $2, true) RETURNING id, name, is_default AS "isDefault"',
    [userId, '기본']
  );
  return rows[0];
}

export async function findCategoriesByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT id, user_id AS "userId", name, is_default AS "isDefault" FROM category WHERE user_id = $1 ORDER BY is_default DESC, name ASC',
    [userId]
  );
  return rows;
}

export async function findCategoryById(id) {
  const { rows } = await pool.query(
    'SELECT id, user_id AS "userId", name, is_default AS "isDefault" FROM category WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function findDefaultCategoryByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT id FROM category WHERE user_id = $1 AND is_default = true',
    [userId]
  );
  return rows[0] ?? null;
}

export async function createCategory(userId, name) {
  const { rows } = await pool.query(
    'INSERT INTO category (user_id, name, is_default) VALUES ($1, $2, false) RETURNING id, user_id AS "userId", name, is_default AS "isDefault"',
    [userId, name]
  );
  return rows[0];
}

export async function reassignTodosToCategory(fromCategoryId, toCategoryId) {
  await pool.query(
    'UPDATE todo SET category_id = $1 WHERE category_id = $2',
    [toCategoryId, fromCategoryId]
  );
}

export async function deleteCategory(id) {
  await pool.query('DELETE FROM category WHERE id = $1', [id]);
}
