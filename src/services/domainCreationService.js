import Domain from '../models/Domain.js';
import Category from '../models/Category.js';
import slugify from '../utils/slugify.js';

export const createDomainWithCategory = async (domainData) => {
  // Start a transaction to ensure atomic operations
  const transaction = await Domain.sequelize.transaction();

  try {
    // Attempt to find or create a category
    let category = await Category.findOne({
      where: { 
        title: domainData.category_name || 'Uncategorized Domains' 
      },
      transaction
    });

    // If category doesn't exist, create it
    if (!category) {
      category = await Category.create({
        title: domainData.category_name || 'Uncategorized Domains',
        slug: slugify(domainData.category_name || 'uncategorized-domains'),
        description: 'Automatically created category for domains',
        is_active: true
      }, { transaction });
    }

    // Prepare domain data with the category ID
    const finalDomainData = {
      ...domainData,
      categoryId: category.id,
      category_name: category.title,
      // Ensure full domain validation
      name: domainData.name.includes('.') 
        ? domainData.name 
        : `${domainData.name}.com`,
      fullDomain: domainData.fullDomain || `${domainData.name}.com`,
      extension: domainData.extension || 'com',
      slug: domainData.slug || slugify(domainData.name)
    };

    // Create the domain
    const domain = await Domain.create(finalDomainData, { transaction });

    // Increment domain count for the category
    await category.increment('domain_count', { transaction });

    // Commit the transaction
    await transaction.commit();

    return domain;
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    // Log the detailed error
    console.error('Domain creation error:', error);

    // Throw a more informative error
    throw new Error(`Domain creation failed: ${error.message}`);
  }
};

// Utility function to create a default domain
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

export default { createDomainWithCategory, createDefaultDomain };
