import express from 'express';
import session from 'express-session';
import passport from './middlewares/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import sequelize, { syncDatabase } from './config/config.js';
import Domain from './models/Domain.js';
import Category from './models/Category.js';
import User from './models/User.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { SECRET_KEY } from './environments/auth_env.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Domain Sales API',
      version: '1.0.0',
      description: 'API documentation for domain sales platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(session({ secret: SECRET_KEY, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/google-auth', googleAuthRoutes);

syncDatabase({
  Domain,
  Category,
  User
}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});