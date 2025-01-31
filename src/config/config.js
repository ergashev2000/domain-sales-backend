import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME || 'domain_sell', 
  process.env.DATABASE_USER || 'postgres', 
  process.env.DATABASE_PASSWORD || '1234', 
  {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    dialect: 'postgres',
    
    pool: {
      max: 10,        
      min: 0,         
      acquire: 30000, 
      idle: 10000     
    },
    
    logging: process.env.NODE_ENV === 'development' 
      ? console.log 
      : false,
    
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      useUTC: false,
      dateStrings: true,
      typeCast: true
    },
    
    retry: {
      max: 3,         
      backoffBase: 1000, 
      backoffExponent: 1.5
    },
    
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

export const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export const closeDatabaseConnection = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

export const syncDatabase = async (models, options = {}) => {
  try {
    await testDatabaseConnection();

    const syncOptions = {
      alter: process.env.NODE_ENV === 'development', 
      force: false, 
      logging: process.env.NODE_ENV === 'development' 
        ? console.log 
        : false,
      ...options
    };

    for (const modelName in models) {
      if (models[modelName].sync) {
        await models[modelName].sync(syncOptions);
        console.log(`Model ${modelName} synchronized successfully`);
      }
    }

    console.log('Database synchronization completed');
    return true;
  } catch (error) {
    console.error('Database synchronization failed:', error);
    
    await closeDatabaseConnection();
    
    throw error;
  }
};

export default sequelize;