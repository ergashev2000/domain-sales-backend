import * as CategoryService from '../services/categoryService.js';
import { validateCategory } from '../utils/validators.js';

export const createCategory = async (req, res) => {
  try {
    const categoryData = {
      title: req.body.title || null,
      description: req.body.description || '',
      slug: req.body.slug || null,
      icon: req.body.icon || null,
      domain_count: req.body.domain_count || 0,
      meta_title: req.body.meta_title || null,
      meta_description: req.body.meta_description || null,
      keywords: req.body.keywords || [],
      is_active: req.body.is_active ?? true,
      sort_order: req.body.sort_order || 0,
      parent_id: req.body.parent_id || null
    };

    // Validate category data
    const validationErrors = validateCategory(categoryData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const category = await CategoryService.createCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ 
      error: 'Category creation failed', 
      message: error.message 
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { 
      is_active, 
      page, 
      limit,
      order,
      search,
      parent_id,
      min_domain_count,
      max_domain_count,
      sort_by = 'sort_order'
    } = req.query;

    const filters = {
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      order: order || 'DESC',
      search,
      parent_id: parent_id ? parseInt(parent_id) : undefined,
      min_domain_count: min_domain_count ? parseInt(min_domain_count) : undefined,
      max_domain_count: max_domain_count ? parseInt(max_domain_count) : undefined,
      sort_by
    };

    const result = await CategoryService.getAllCategories(filters);

    res.json({
      categories: result.rows,
      total: result.count,
      page: filters.page,
      limit: filters.limit,
      metadata: {
        total_active: result.activeCount,
        total_inactive: result.inactiveCount
      }
    });
  } catch (error) {
    console.error('Category list error:', error);
    res.status(500).json({ 
      error: 'Category list failed', 
      message: error.message 
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const includeDetails = req.query.include_details === 'true';
    const category = await CategoryService.getCategoryById(req.params.id, includeDetails);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found', 
        details: 'Category with the given id does not exist' 
      });
    }

    res.json(category);
  } catch (error) {
    console.error('Category by id error:', error);
    res.status(500).json({ 
      error: 'Category by id failed', 
      message: error.message 
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      slug: req.body.slug,
      icon: req.body.icon,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      keywords: req.body.keywords,
      is_active: req.body.is_active,
      sort_order: req.body.sort_order,
      parent_id: req.body.parent_id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const category = await CategoryService.updateCategory(categoryId, updateData);
    res.json(category);
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ 
      error: 'Category update failed', 
      message: error.message 
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const force = req.query.force === 'true';
    
    const result = await CategoryService.deleteCategory(categoryId, force);
    
    res.json({
      message: 'Category deleted successfully',
      details: result
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ 
      error: 'Category deletion failed', 
      message: error.message 
    });
  }
};

export const getCategoryDomains = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { 
      page = 1, 
      limit = 20, 
      is_active,
      sort_by = 'created_at',
      order = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      sort_by,
      order
    };

    const result = await CategoryService.getCategoryDomains(categoryId, filters);

    res.json({
      domains: result.rows,
      total: result.count,
      page: filters.page,
      limit: filters.limit
    });
  } catch (error) {
    console.error('Category domains error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve category domains', 
      message: error.message 
    });
  }
};
