import { pool } from '../server.js';
import slugify from '../utils/slugify.js';

class Category {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.slug = data.slug || slugify(data.title);
    this.icon = data.icon;
    this.domain_count = data.domain_count || 0;
    this.meta_title = data.meta_title;
    this.meta_description = data.meta_description;
    this.keywords = data.keywords || [];
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.sort_order = data.sort_order || 0;
  }

  // Validate category data
  validate() {
    if (!this.title || this.title.length < 2 || this.title.length > 100) {
      throw new Error('Category title must be between 2 and 100 characters');
    }
    if (this.icon && !this.isValidUrl(this.icon)) {
      throw new Error('Icon must be a valid URL');
    }
  }

  // URL validation helper
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Create a new category
  static async create(categoryData) {
    const category = new Category(categoryData);
    category.validate();

    const query = `
      INSERT INTO categories 
      (title, description, slug, icon, domain_count, meta_title, meta_description, keywords, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      category.title,
      category.description,
      category.slug,
      category.icon,
      category.domain_count,
      category.meta_title,
      category.meta_description,
      category.keywords,
      category.is_active,
      category.sort_order
    ];

    try {
      const result = await pool.query(query, values);
      return new Category(result.rows[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Increment domain count
  static async incrementDomainCount(categoryId) {
    const query = `
      UPDATE categories 
      SET domain_count = domain_count + 1 
      WHERE id = $1 
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [categoryId]);
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      return new Category(result.rows[0]);
    } catch (error) {
      console.error('Error incrementing domain count:', error);
      throw error;
    }
  }

  // Decrement domain count
  static async decrementDomainCount(categoryId) {
    const query = `
      UPDATE categories 
      SET domain_count = GREATEST(domain_count - 1, 0) 
      WHERE id = $1 
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [categoryId]);
      if (result.rows.length === 0) {
        throw new Error('Category not found');
      }
      return new Category(result.rows[0]);
    } catch (error) {
      console.error('Error decrementing domain count:', error);
      throw error;
    }
  }

  // Get categories with domain count
  static async getCategoriesWithDomainCount() {
    const query = `
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY domain_count DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => new Category(row));
    } catch (error) {
      console.error('Error getting categories with domain count:', error);
      throw error;
    }
  }
}

export default Category;
