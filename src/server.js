require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');
const Domain = require('./models/Domain');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/domains', require('./routes/domainRoutes'));

// Database Relations
User.hasMany(Domain, { foreignKey: 'userId', as: 'domains' });
Domain.belongsTo(User, { foreignKey: 'userId' });

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Sync models
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
