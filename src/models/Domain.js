import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/db.js';

// Validate domain name format
const validateDomainName = (value) => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(value);
};

// Create a new domain
export const createDomain = async (domainData) => {
  try {
    const { 
      name, 
      fullDomain, 
      slug, 
      extension, 
      price = 0.00, 
      status = 'available',
      categoryId 
    } = domainData;

    // Validate domain name
    if (!validateDomainName(name)) {
      throw new Error('Invalid domain format');
    }

    const createDomainQuery = {
      text: `
        INSERT INTO domains 
        (id, name, full_domain, slug, extension, price, status, category_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `,
      values: [
        uuidv4(),
        name,
        fullDomain,
        slug,
        extension,
        price,
        status,
        categoryId
      ]
    };

    const result = await executeQuery(createDomainQuery);
    return result.rows[0];
  } catch (error) {
    console.error('Domain creation error:', error);
    throw error;
  }
};

// Find domain by ID
export const findDomainById = async (domainId) => {
  try {
    const getDomainQuery = {
      text: 'SELECT * FROM domains WHERE id = $1',
      values: [domainId]
    };

    const result = await executeQuery(getDomainQuery);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Find domain by ID error:', error);
    throw error;
  }
};

// Find domain by name
export const findDomainByName = async (name) => {
  try {
    const getDomainQuery = {
      text: 'SELECT * FROM domains WHERE name = $1',
      values: [name]
    };

    const result = await executeQuery(getDomainQuery);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Find domain by name error:', error);
    throw error;
  }
};

// Update domain
export const updateDomain = async (domainId, updateData) => {
  try {
    const { 
      name, 
      fullDomain, 
      slug, 
      extension, 
      price, 
      status,
      categoryId 
    } = updateData;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      // Validate domain name if provided
      if (!validateDomainName(name)) {
        throw new Error('Invalid domain format');
      }
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (fullDomain) {
      updateFields.push(`full_domain = $${paramCount}`);
      values.push(fullDomain);
      paramCount++;
    }
    if (slug) {
      updateFields.push(`slug = $${paramCount}`);
      values.push(slug);
      paramCount++;
    }
    if (extension) {
      updateFields.push(`extension = $${paramCount}`);
      values.push(extension);
      paramCount++;
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }
    if (status) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (categoryId) {
      updateFields.push(`category_id = $${paramCount}`);
      values.push(categoryId);
      paramCount++;
    }

    values.push(domainId);

    const updateDomainQuery = {
      text: `
        UPDATE domains 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `,
      values
    };

    const result = await executeQuery(updateDomainQuery);
    return result.rows[0];
  } catch (error) {
    console.error('Domain update error:', error);
    throw error;
  }
};

// Delete domain
export const deleteDomain = async (domainId) => {
  try {
    const deleteDomainQuery = {
      text: 'DELETE FROM domains WHERE id = $1',
      values: [domainId]
    };

    await executeQuery(deleteDomainQuery);
    return true;
  } catch (error) {
    console.error('Domain deletion error:', error);
    throw error;
  }
};

// List domains with optional filtering and pagination
export const listDomains = async (filters = {}) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      categoryId,
      minPrice,
      maxPrice,
      sort_by = 'created_at',
      order = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    const whereClauses = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      whereClauses.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (categoryId) {
      whereClauses.push(`category_id = $${paramCount}`);
      values.push(categoryId);
      paramCount++;
    }

    if (minPrice !== undefined) {
      whereClauses.push(`price >= $${paramCount}`);
      values.push(minPrice);
      paramCount++;
    }

    if (maxPrice !== undefined) {
      whereClauses.push(`price <= $${paramCount}`);
      values.push(maxPrice);
      paramCount++;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = {
      text: `SELECT COUNT(*) FROM domains ${whereClause}`,
      values
    };

    const listQuery = {
      text: `
        SELECT * FROM domains 
        ${whereClause} 
        ORDER BY ${sort_by} ${order} 
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `,
      values: [...values, limit, offset]
    };

    const [countResult, listResult] = await Promise.all([
      executeQuery(countQuery),
      executeQuery(listQuery)
    ]);

    return {
      domains: listResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  } catch (error) {
    console.error('List domains error:', error);
    throw error;
  }
};

export default {
  createDomain,
  findDomainById,
  findDomainByName,
  updateDomain,
  deleteDomain,
  listDomains
};
