import { executeQuery, runTransaction } from '../config/db.js';
import slugify from '../utils/slugify.js';

export const createCategory = async (categoryData) => {
  try {
    if (!categoryData || !categoryData.title) {
      throw new Error('Category title is required');
    }

    const generatedSlug = slugify(categoryData.title);
    categoryData.slug = categoryData.slug || generatedSlug;

    // Check existing slug
    const existingSlugQuery = `
      SELECT slug FROM categories WHERE slug = $1
    `;
    const existingSlug = await executeQuery(existingSlugQuery, [categoryData.slug]);

    if (existingSlug.length > 0) {
      categoryData.slug = `${generatedSlug}-${Date.now()}`;
    }

    // Prepare category data
    const keywords = Array.isArray(categoryData.keywords) 
      ? categoryData.keywords 
      : [categoryData.keywords];

    const query = `
      INSERT INTO categories (
        title, 
        description, 
        slug, 
        icon, 
        domain_count, 
        meta_title, 
        meta_description, 
        keywords, 
        is_active, 
        sort_order,
        parent_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `;

    const values = [
      categoryData.title,
      categoryData.description || '',
      categoryData.slug,
      categoryData.icon || null,
      categoryData.domain_count || 0,
      categoryData.meta_title || null,
      categoryData.meta_description || null,
      keywords,
      categoryData.is_active ?? true,
      categoryData.sort_order || 0,
      categoryData.parent_id || null
    ];

    const [newCategory] = await executeQuery(query, values);
    return newCategory;
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
    order = 'DESC',
    search,
    parent_id,
    min_domain_count,
    max_domain_count,
    sort_by = 'sort_order'
  } = filters;

  const offset = (page - 1) * limit;

  let whereConditions = [];
  const queryParams = [];

  if (is_active !== undefined) {
    queryParams.push(is_active);
    whereConditions.push(`is_active = $${queryParams.length}`);
  }

  if (search) {
    queryParams.push(`%${search.toLowerCase()}%`);
    whereConditions.push(`(LOWER(title) LIKE $${queryParams.length} OR LOWER(description) LIKE $${queryParams.length})`);
  }

  if (parent_id !== undefined) {
    queryParams.push(parent_id);
    whereConditions.push(`parent_id = $${queryParams.length}`);
  }

  if (min_domain_count !== undefined) {
    queryParams.push(min_domain_count);
    whereConditions.push(`domain_count >= $${queryParams.length}`);
  }

  if (max_domain_count !== undefined) {
    queryParams.push(max_domain_count);
    whereConditions.push(`domain_count <= $${queryParams.length}`);
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';

  const countQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
      COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_count
    FROM categories 
    ${whereClause}
  `;

  const categoriesQuery = `
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM domains WHERE domains.category_id = c.id) as domain_count
    FROM categories c
    ${whereClause}
    ORDER BY c.${sort_by} ${order}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;

  const [countResult] = await executeQuery(countQuery, queryParams);
  const categories = await executeQuery(categoriesQuery, [...queryParams, limit, offset]);

  return {
    rows: categories,
    count: parseInt(countResult.total),
    activeCount: parseInt(countResult.active_count),
    inactiveCount: parseInt(countResult.inactive_count)
  };
};

export const getCategoryById = async (id, includeDetails = false) => {
  try {
    let query = `
      SELECT c.*, 
      (SELECT COUNT(*) FROM domains WHERE domains.category_id = c.id) as domain_count,
      (SELECT title FROM categories p WHERE p.id = c.parent_id) as parent_title
      FROM categories c 
      WHERE c.id = $1
    `;

    if (includeDetails) {
      query += `
        LEFT JOIN domains d ON d.category_id = c.id
        GROUP BY c.id, p.title
      `;
    }

    const [category] = await executeQuery(query, [id]);
    return category || null;
  } catch (error) {
    console.error('Get category by ID error:', error);
    throw new Error(`Failed to retrieve category: ${error.message}`);
  }
};

export const updateCategory = async (id, updateData) => {
  try {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'description', 'slug', 'icon', 
      'meta_title', 'meta_description', 'keywords', 
      'is_active', 'sort_order', 'parent_id'
    ];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid update fields provided');
    }

    values.push(id);

    const query = `
      UPDATE categories 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [updatedCategory] = await executeQuery(query, values);
    return updatedCategory;
  } catch (error) {
    console.error('Category update error:', error);
    throw new Error(`Category update failed: ${error.message}`);
  }
};

export const deleteCategory = async (id, force = false) => {
  try {
    // Check for associated domains
    const domainCountQuery = `
      SELECT COUNT(*) as domain_count 
      FROM domains 
      WHERE category_id = $1
    `;
    const [domainCountResult] = await executeQuery(domainCountQuery, [id]);

    if (domainCountResult.domain_count > 0 && !force) {
      throw new Error('Cannot delete category with associated domains. Use force=true to override.');
    }

    // Delete domains if force is true
    if (force) {
      await executeQuery('DELETE FROM domains WHERE category_id = $1', [id]);
    }

    // Delete category
    const deleteQuery = `
      DELETE FROM categories 
      WHERE id = $1 
      RETURNING *
    `;
    const [deletedCategory] = await executeQuery(deleteQuery, [id]);

    return {
      deleted_category: deletedCategory,
      deleted_domains_count: domainCountResult.domain_count
    };
  } catch (error) {
    console.error('Category deletion error:', error);
    throw new Error(`Category deletion failed: ${error.message}`);
  }
};

export const getCategoryDomains = async (categoryId, filters = {}) => {
  const { 
    page = 1, 
    limit = 20, 
    is_active,
    sort_by = 'created_at',
    order = 'DESC'
  } = filters;

  const offset = (page - 1) * limit;

  let whereConditions = [`category_id = $1`];
  const queryParams = [categoryId];

  if (is_active !== undefined) {
    queryParams.push(is_active);
    whereConditions.push(`is_active = $${queryParams.length}`);
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM domains 
    ${whereClause}
  `;

  const domainsQuery = `
    SELECT * 
    FROM domains 
    ${whereClause}
    ORDER BY ${sort_by} ${order}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;

  const [countResult] = await executeQuery(countQuery, queryParams);
  const domains = await executeQuery(domainsQuery, [...queryParams, limit, offset]);

  return {
    rows: domains,
    count: parseInt(countResult.total)
  };
};
