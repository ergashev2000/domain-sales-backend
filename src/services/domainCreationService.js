import { runTransaction, executeQuery } from '../config/db.js';
import slugify from '../utils/slugify.js';

export const createDomainWithCategory = async (domainData) => {
  try {
    // Prepare category name
    const categoryName = domainData.category_name || 'Uncategorized Domains';
    const categorySlug = slugify(categoryName);

    // Transaction queries
    const queries = [
      // First, find or create category
      {
        query: `
          INSERT INTO categories (
            title, 
            slug, 
            description, 
            is_active
          ) 
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (slug) DO UPDATE 
          SET title = EXCLUDED.title
          RETURNING id, title
        `,
        params: [
          categoryName, 
          categorySlug, 
          'Automatically created category for domains', 
          true
        ]
      },
      // Then, create domain
      {
        query: `
          INSERT INTO domains (
            name, 
            full_domain, 
            category_id, 
            category_name, 
            extension, 
            slug, 
            price, 
            status, 
            listing_type
          ) 
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) 
          RETURNING *
        `,
        params: [
          domainData.name.includes('.') 
            ? domainData.name 
            : `${domainData.name}.com`,
          domainData.fullDomain || `${domainData.name}.com`,
          null,  // Placeholder for category ID
          categoryName,
          domainData.extension || 'com',
          slugify(domainData.name),
          domainData.price || 0,
          domainData.status || 'available',
          domainData.listingType || 'regular'
        ]
      }
    ];

    // Run transaction
    const [categoryResult, domainResult] = await runTransaction(queries);

    // Update domain with category ID
    const categoryId = categoryResult[0].id;
    const updateDomainQuery = `
      UPDATE domains 
      SET category_id = $1 
      WHERE id = $2 
      RETURNING *
    `;

    const [updatedDomain] = await executeQuery(updateDomainQuery, [
      categoryId, 
      domainResult[0].id
    ]);

    // Increment category domain count
    const incrementCategoryQuery = `
      UPDATE categories 
      SET domain_count = domain_count + 1 
      WHERE id = $1
    `;
    await executeQuery(incrementCategoryQuery, [categoryId]);

    return updatedDomain;
  } catch (error) {
    console.error('Domain creation error:', error);
    throw new Error(`Domain creation failed: ${error.message}`);
  }
};

export const createDefaultDomain = async () => {
  const defaultDomainData = {
    name: "example-domain",
    fullDomain: "example-domain.com",
    price: 1000.00,
    status: "available",
    listingType: "regular",
    category_name: "Default Domains"
  };

  return createDomainWithCategory(defaultDomainData);
};

export default { 
  createDomainWithCategory, 
  createDefaultDomain 
};
