import Domain from '../models/Domain.js';
import Category from '../models/Category.js';
import { Op } from 'sequelize';
import { 
  parseNumericFilter, 
  buildNumericFilter, 
  buildTextFilter, 
  mergeConditions 
} from '../utils/queryHelpers.js';

export const createDomain = async (domainData) => {
  try {
    const slug = domainData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const extensionMatch = domainData.name.match(/\.([a-z]{2,})$/i);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

    // Handle category association
    let categoryId = null;
    if (domainData.category) {
      const [categoryInstance] = await Category.findOrCreate({
        where: { title: domainData.category },
        defaults: { 
          title: domainData.category,
          slug: domainData.category.toLowerCase().replace(/\s+/g, '-')
        }
      });
      categoryId = categoryInstance.id;
    }

    const fullDomainData = {
      ...domainData,
      slug,
      extension,
      fullDomain: domainData.name,
      categoryId  // Add categoryId to the domain data
    };

    return await Domain.create(fullDomainData);
  } catch (error) {
    throw new Error(`Domain creation failed: ${error.message}`);
  }
};

/**
 * Retrieve domains with advanced filtering and pagination
 * @param {Object} filters - Filtering and pagination options
 * @returns {Promise<Object>} Paginated domain results
 */
export const getAllDomains = async (filters = {}) => {
  const {
    status,
    minPrice,
    maxPrice,
    category,
    listingType,
    search,
    page,
    limit
  } = filters;

  // Determine if pagination is needed
  const isPaginated = page !== undefined && limit !== undefined;

  // Validate and prepare pagination (if applicable)
  const safeLimit = isPaginated 
    ? parseNumericFilter(limit, { 
        defaultValue: 20, 
        min: 1, 
        max: 100 
      }) || 20 
    : null;
  
  const safeOffset = isPaginated 
    ? ((parseNumericFilter(page, { min: 1 }) || 1) - 1) * safeLimit 
    : null;

  // Build where conditions
  const whereConditions = mergeConditions(
    // Price filter
    buildNumericFilter('price', minPrice, maxPrice),
    
    // Status filter
    status ? { status } : {},
    
    // Listing type filter
    listingType ? { listingType } : {},
    
    // Search filter
    search ? buildTextFilter('name', search) : {}
  );

  // Category filtering with dynamic lookup
  if (category) {
    const categoryInstance = await Category.findOne({
      where: {
        [Op.or]: [
          { title: category },
          { slug: category }
        ]
      }
    });

    if (categoryInstance) {
      whereConditions.categoryId = categoryInstance.id;
    }
  }

  try {
    // Conditional query based on pagination
    const queryOptions = {
      where: whereConditions,
      include: [
        {
          model: Category,
          as: 'domainCategory',
          attributes: ['id', 'title', 'slug']
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true
    };

    // Add pagination if specified
    if (isPaginated) {
      queryOptions.limit = safeLimit;
      queryOptions.offset = safeOffset;
    }

    // Perform query
    const result = isPaginated 
      ? await Domain.findAndCountAll(queryOptions)
      : await Domain.findAll(queryOptions);

    // Return format depends on pagination
    return isPaginated 
      ? {
          domains: result.rows,
          total: result.count,
          page: parseNumericFilter(page, { min: 1 }) || 1,
          limit: safeLimit,
          totalPages: Math.ceil(result.count / safeLimit)
        }
      : result;
  } catch (error) {
    console.error('Domain retrieval error:', error);
    throw new Error(`Failed to retrieve domains: ${error.message}`);
  }
};

export const getDomainById = async (id) => {
  return await Domain.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'domainCategory',
        attributes: ['id', 'title', 'slug']
      }
    ]
  });
};

export const updateDomain = async (id, updateData) => {
  const domain = await Domain.findByPk(id);
  
  if (!domain) {
    throw new Error('Domain not found');
  }

  if (!updateData.viewCount) {
    updateData.viewCount = (domain.viewCount || 0) + 1;
  }

  return await domain.update(updateData);
};

export const patchDomain = async (id, patchData) => {
  // Find the domain first
  const domain = await Domain.findByPk(id);
  
  if (!domain) {
    throw new Error('Domain not found');
  }

  // Remove undefined and null values
  const cleanPatchData = Object.fromEntries(
    Object.entries(patchData)
      .filter(([_, v]) => v !== undefined && v !== null)
  );

  // Automatically increment view count if not explicitly set
  if (!cleanPatchData.viewCount) {
    cleanPatchData.viewCount = (domain.viewCount || 0) + 1;
  }

  // Validate and sanitize specific fields
  if (cleanPatchData.price !== undefined) {
    const parsedPrice = parseFloat(cleanPatchData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new Error('Invalid price value');
    }
    cleanPatchData.price = parsedPrice;
  }

  // Handle category updates
  if (cleanPatchData.categoryId) {
    const newCategory = await Category.findByPk(cleanPatchData.categoryId);
    if (!newCategory) {
      throw new Error('Invalid category ID');
    }
    cleanPatchData.category_name = newCategory.title;
  }

  // Validate status transitions if status is being changed
  if (cleanPatchData.status) {
    const allowedStatusTransitions = {
      'available': ['reserved', 'taken', 'pending'],
      'reserved': ['available', 'taken'],
      'pending': ['available', 'taken'],
      'taken': ['available']
    };

    if (!allowedStatusTransitions[domain.status]?.includes(cleanPatchData.status)) {
      throw new Error(`Invalid status transition from ${domain.status} to ${cleanPatchData.status}`);
    }
  }

  // Perform partial update
  return await domain.update(cleanPatchData);
};

export const deleteDomain = async (id) => {
  const domain = await Domain.findByPk(id);
  
  if (!domain) {
    throw new Error('Domain not found');
  }

  return await domain.destroy();
};

export const searchDomains = async (query) => {
  return await Domain.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { category: { [Op.iLike]: `%${query}%` } },
        { tags: { [Op.contains]: [query] } }
      ]
    }
  });
};

export const recommendDomains = async (domainId) => {
  const domain = await Domain.findByPk(domainId, {
    include: [{ model: Category, as: 'domainCategory' }]
  });
  
  if (!domain) {
    throw new Error('Domain not found');
  }

  return await Domain.findAll({
    where: {
      categoryId: domain.categoryId,
      status: 'available',
      id: { [Op.ne]: domainId }
    },
    limit: 5,
    include: [{ model: Category, as: 'domainCategory' }]
  });
};
