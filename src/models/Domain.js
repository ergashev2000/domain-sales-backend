import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/config.js';
import Category from './Category.js';

class Domain extends Model {
  static associate(models) {
    this.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'domainCategory'
    });
  }
}

Domain.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isValidDomain(value) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(value)) {
          throw new Error('Invalid domain format');
        }
      }
    }
  },
  fullDomain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  extension: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true
    },
    get() {
      const rawValue = this.getDataValue('price');
      return rawValue !== null ? Number(rawValue) : 0;
    },
    set(value) {
      this.setDataValue('price', 
        value !== null && !isNaN(value) 
          ? Number(value).toFixed(2) 
          : 0
      );
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'taken', 'reserved', 'pending'),
    defaultValue: 'available'
  },
  listingType: {
    type: DataTypes.ENUM('regular', 'premium', 'featured'),
    defaultValue: 'regular'
  },
  registrar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  registrationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  age: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      years: 0,
      months: null
    }
  },
  traffic: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      monthlyVisitors: 0,
      uniqueVisitors: null,
      trend: null
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: "id",
    },
    field: 'category_id'
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  domainAuthority: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pageAuthority: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  backlinksCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  additionalServices: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      sslCertificate: false,
      dnsManagement: false,
      emailForwarding: false,
      domainProtection: false
    }
  },
  similarDomains: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: true
  },
  transferDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      transferTime: null,
      transferCost: null,
      instantTransfer: false
    }
  },
  auctionDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      isAuctionItem: false,
      startingPrice: null,
      currentHighestBid: null,
      auctionEndDate: null
    }
  },
  promotion: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      isActive: false,
      discountEndsAt: null,
      remainingTime: null
    }
  },
  verificationStatus: {
    type: DataTypes.ENUM('verified', 'pending', 'unverified'),
    allowNull: true
  },
  legalClearance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ownershipRestrictions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      businessOnly: false,
      regionalRestrictions: null
    }
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inquiryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  potentialUseCases: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  recommendationScore: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  additionalImages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Domain',
  tableName: 'domains',
  timestamps: true,
  hooks: {
    beforeCreate: async (domain, options) => {
      if (domain.categoryId) {
        const category = await Category.findByPk(domain.categoryId);
        if (category) {
          domain.category_name = category.title;
        }
      }
    }
  }
});

export default Domain;
