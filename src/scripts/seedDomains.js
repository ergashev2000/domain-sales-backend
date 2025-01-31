import Domain from '../models/Domain.js';
import domainData from '../../domain-examples.json' assert { type: 'json' };
import sequelize from '../config/config.js';

async function seedDomains() {
  try {
    // Sync the model with the database
    await sequelize.sync({ force: true });

    // Insert domains
    const domains = await Domain.bulkCreate(domainData.domains, {
      validate: true,
      individualHooks: true
    });

    console.log(`Successfully seeded ${domains.length} domains`);
  } catch (error) {
    console.error('Error seeding domains:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the seeding function
seedDomains();
