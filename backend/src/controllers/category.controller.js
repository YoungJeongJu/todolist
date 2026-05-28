import * as categoryService from '../services/category.service.js';

export async function getCategories(req, res, next) {
  try {
    const result = await categoryService.getCategories(req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    const result = await categoryService.createCategory(req.user.id, name);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
