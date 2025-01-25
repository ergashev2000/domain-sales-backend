import * as CategoryService from '../services/categoryService.js';

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
      sort_order: req.body.sort_order || 0
    };

    if (!categoryData.title) {
      return res.status(400).json({ 
        error: 'Title is required', 
        details: 'Please provide a title for the category' 
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
    console.log('Incoming category list request:', req.query);

    const { 
      is_active, 
      page, 
      limit,
      order 
    } = req.query;

    const categories = await CategoryService.getAllCategories({
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit),
      order
    });

    res.json({
      categories: categories.rows,
      total: categories.count,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
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
    console.log('Incoming category by id request:', req.params.id);

    const category = await CategoryService.getCategoryById(req.params.id);
    
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

export const getCategoryBySlug = async (req, res) => {
  try {
    console.log('Incoming category by slug request:', req.params.slug);

    const category = await CategoryService.getCategoryBySlug(req.params.slug);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found', 
        details: 'Category with the given slug does not exist' 
      });
    }

    res.json(category);
  } catch (error) {
    console.error('Category by slug error:', error);
    res.status(500).json({ 
      error: 'Category by slug failed', 
      message: error.message 
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    console.log('Incoming category update request:', req.params.id, req.body);

    const category = await CategoryService.updateCategory(req.params.id, req.body);
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
    console.log('Incoming category delete request:', req.params.id);

    await CategoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Category delete error:', error);
    res.status(500).json({ 
      error: 'Category delete failed', 
      message: error.message 
    });
  }
};
