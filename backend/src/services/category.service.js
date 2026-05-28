import * as categoryRepo from '../repositories/category.repository.js';

export async function getCategories(userId) {
  return { categories: await categoryRepo.findCategoriesByUserId(userId) };
}

export async function createCategory(userId, name) {
  if (!name || name.trim().length < 1 || name.trim().length > 30) {
    const err = new Error('카테고리 이름은 1~30자여야 합니다.'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }
  const category = await categoryRepo.createCategory(userId, name.trim());
  return { category };
}

export async function deleteCategory(userId, categoryId) {
  const category = await categoryRepo.findCategoryById(categoryId);
  if (!category) {
    const err = new Error('카테고리를 찾을 수 없습니다.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
  }
  if (category.userId !== userId) {
    const err = new Error('접근 권한이 없습니다.'); err.status = 403; err.code = 'FORBIDDEN'; throw err;
  }
  if (category.isDefault) {
    const err = new Error("'기본' 카테고리는 삭제할 수 없습니다."); err.status = 400; err.code = 'CANNOT_DELETE_DEFAULT_CATEGORY'; throw err;
  }
  const defaultCategory = await categoryRepo.findDefaultCategoryByUserId(userId);
  await categoryRepo.reassignTodosToCategory(categoryId, defaultCategory.id);
  await categoryRepo.deleteCategory(categoryId);
}
