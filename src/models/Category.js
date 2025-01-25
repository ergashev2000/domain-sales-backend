import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/config.js';
import slugify from '../utils/slugify.js';

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Category title cannot be empty"
      },
      len: {
        args: [2, 100],
        msg: "Category title must be between 2 and 100 characters"
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: "Icon must be a valid URL"
      }
    }
  },
  domain_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  meta_title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  hooks: {
    beforeCreate: (category) => {
      category.slug = slugify(category.title);
    }
  }
});

// Function to increment domain count
const incrementDomainCount = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (category) {
      category.domain_count += 1;
      await category.save();
      return category;
    }
    throw new Error('Category not found');
  } catch (error) {
    console.error('Error incrementing domain count:', error);
    throw error;
  }
};

// Function to decrement domain count
const decrementDomainCount = async (categoryId) => {
  try {
    const category = await Category.findByPk(categoryId);
    if (category && category.domain_count > 0) {
      category.domain_count -= 1;
      await category.save();
      return category;
    }
    throw new Error('Category not found or domain count is already 0');
  } catch (error) {
    console.error('Error decrementing domain count:', error);
    throw error;
  }
};

// Function to get categories with domain count
const getCategoriesWithDomainCount = async () => {
  try {
    return await Category.findAll({
      order: [['domain_count', 'DESC']],
      where: {
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error getting categories with domain count:', error);
    throw error;
  }
};

// Export the functions along with the model
Category.incrementDomainCount = incrementDomainCount;
Category.decrementDomainCount = decrementDomainCount;
Category.getCategoriesWithDomainCount = getCategoriesWithDomainCount;

export default Category;
