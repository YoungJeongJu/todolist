import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json(user);
  } catch (err) { next(err); }
}

export async function updateMe(req, res, next) {
  try {
    const result = await authService.updateMe(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function deleteMe(req, res, next) {
  try {
    await authService.deleteMe(req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
