import sequelize from "../config/config.js";
import Category from "./Category.js";
import Domain from "./Domain.js";

// Setup model associations
const setupAssociations = () => {
  // Define associations
  Category.hasMany(Domain, {
    foreignKey: 'categoryId',
    as: 'domainList',
    onDelete: 'CASCADE'
  });

  Domain.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'domainCategory'
  });
};

// Initialize associations
setupAssociations();

export { 
  sequelize, 
  Category, 
  Domain 
};
