import Category from '../models/Category.js';
import Domain from '../models/Domain.js';
import slugify from '../utils/slugify.js';

export const createCategory = async (categoryData) => {
  try {
    if (!categoryData || !categoryData.title) {
      throw new Error('Category title is required');
    }

    const generatedSlug = slugify(categoryData.title);
    categoryData.slug = categoryData.slug || generatedSlug;

    const existingCategory = await Category.findOne({ 
      where: { slug: categoryData.slug } 
    });

    if (existingCategory) {
      categoryData.slug = `${generatedSlug}-${Date.now()}`;
    }

    if (categoryData.keywords && !Array.isArray(categoryData.keywords)) {
      categoryData.keywords = [categoryData.keywords];
    }

    categoryData.is_active = categoryData.is_active ?? true;
    categoryData.sort_order = categoryData.sort_order ?? 0;
    categoryData.domain_count = categoryData.domain_count ?? 0;

    return await Category.create(categoryData);
  } catch (error) {
    console.error('Category creation error:', error);
    throw new Error(`Category creation failed: ${error.message}`);
  }
};

export const getAllCategories = async (filters = {}) => {
  const { 
    is_active, 
    page = 1, 
    limit = 20,
    order = 'DESC' 
  } = filters;

  const whereCondition = {};
  if (is_active !== undefined) {
    whereCondition.is_active = is_active;
  }

  return await Category.findAndCountAll({
    where: whereCondition,
    limit,
    offset: (page - 1) * limit,
    order: [['sort_order', order]],
    include: [{
      model: Domain,
      as: 'domains',
      attributes: ['id', 'name']
    }]
  });
};

export const getCategoryById = async (id) => {
  return await Category.findByPk(id, {
    include: [{
      model: Domain,
      as: 'domains',
      attributes: ['id', 'name', 'price']
    }]
  });
};

export const updateCategory = async (id, updateData) => {
  const category = await Category.findByPk(id);
  
  if (!category) {
    throw new Error('Category not found');
  }

  if (updateData.title && updateData.title !== category.title) {
    updateData.slug = slugify(updateData.title);
  }

  return await category.update(updateData);
};

export const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  
  if (!category) {
    throw new Error('Category not found');
  }

  return await category.destroy();
};

export const getCategoryBySlug = async (slug) => {
  return await Category.findOne({ 
    where: { slug },
    include: [{
      model: Domain,
      as: 'domains',
      attributes: ['id', 'name', 'price']
    }]
  });
};
