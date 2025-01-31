import Category from '../models/Category.js';
import sequelize from '../config/config.js';

const categoriesData = [
  {
    title: "Technology",
    description: "Domains related to technology, innovation, and digital solutions",
    icon: "https://example.com/icons/technology.svg",
    keywords: ["tech", "innovation", "digital", "software"],
    sort_order: 1
  },
  {
    title: "Finance",
    description: "Domains for financial services, fintech, and investment platforms",
    icon: "https://example.com/icons/finance.svg",
    keywords: ["finance", "investment", "banking", "money"],
    sort_order: 2
  },
  {
    title: "Healthcare",
    description: "Domains for medical services, health tech, and wellness platforms",
    icon: "https://example.com/icons/healthcare.svg",
    keywords: ["health", "medical", "wellness", "technology"],
    sort_order: 3
  },
  {
    title: "E-commerce",
    description: "Domains for online retail, marketplaces, and shopping platforms",
    icon: "https://example.com/icons/ecommerce.svg",
    keywords: ["shopping", "retail", "online", "marketplace"],
    sort_order: 4
  },
  {
    title: "Education",
    description: "Domains for online learning, educational platforms, and training",
    icon: "https://example.com/icons/education.svg",
    keywords: ["learning", "education", "training", "online courses"],
    sort_order: 5
  }
];

async function seedCategories() {
  try {
    // Sync the model with the database
    await sequelize.sync({ force: true });

    // Insert categories
    const categories = await Category.bulkCreate(categoriesData, {
      validate: true,
      individualHooks: true
    });

    console.log(`Successfully seeded ${categories.length} categories`);
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the seeding function
seedCategories();
