import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/user.repository.js';
import { createDefaultCategory } from '../repositories/category.repository.js';

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(pw) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);
}

export async function register({ email, password, name }) {
  if (!isValidEmail(email)) {
    const err = new Error('유효하지 않은 이메일 형식입니다.'); err.status = 400; err.code = 'INVALID_EMAIL'; throw err;
  }
  if (!isValidPassword(password)) {
    const err = new Error('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.'); err.status = 400; err.code = 'INVALID_PASSWORD'; throw err;
  }
  if (!name || name.trim().length < 1 || name.trim().length > 50) {
    const err = new Error('이름은 1~50자여야 합니다.'); err.status = 400; err.code = 'INVALID_NAME'; throw err;
  }
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    const err = new Error('이미 사용 중인 이메일입니다.'); err.status = 409; err.code = 'DUPLICATE_EMAIL'; throw err;
  }
  const hashed = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);
  const user = await userRepo.createUser({ email, password: hashed, name: name.trim() });
  await createDefaultCategory(user.id);
  const token = issueToken(user);
  return { token, user };
}

export async function login({ email, password }) {
  const user = await userRepo.findUserByEmail(email);
  const INVALID = () => { const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.'); err.status = 401; err.code = 'INVALID_CREDENTIALS'; return err; };
  if (!user) throw INVALID();
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw INVALID();
  const { password: _, ...safeUser } = user;
  const token = issueToken(safeUser);
  return { token, user: safeUser };
}

export async function updateMe(requesterId, { name, currentPassword, newPassword, themeMode }) {
  const fields = {};
  if (name !== undefined) {
    if (name.trim().length < 1 || name.trim().length > 50) {
      const err = new Error('이름은 1~50자여야 합니다.'); err.status = 400; err.code = 'INVALID_NAME'; throw err;
    }
    fields.name = name.trim();
  }
  if (newPassword !== undefined) {
    if (!isValidPassword(newPassword)) {
      const err = new Error('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.'); err.status = 400; err.code = 'INVALID_PASSWORD'; throw err;
    }
    const user = await userRepo.findUserByEmail((await userRepo.findUserById(requesterId)).email);
    const match = await bcrypt.compare(currentPassword ?? '', user.password);
    if (!match) {
      const err = new Error('현재 비밀번호가 올바르지 않습니다.'); err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
    }
    fields.password = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_ROUNDS) || 10);
  }
  if (themeMode !== undefined) {
    if (!['LIGHT', 'DARK'].includes(themeMode)) {
      const err = new Error('themeMode는 LIGHT 또는 DARK여야 합니다.'); err.status = 400; err.code = 'INVALID_THEME'; throw err;
    }
    fields.themeMode = themeMode;
  }
  if (Object.keys(fields).length === 0) {
    const user = await userRepo.findUserById(requesterId);
    return { user };
  }
  const updated = await userRepo.updateUser(requesterId, fields);
  return { user: updated };
}

export async function deleteMe(requesterId) {
  await userRepo.deleteUser(requesterId);
}
