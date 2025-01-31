import express from 'express';
import * as UserController from '../controllers/userController.js';
// import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', UserController.createUser);
router.post('/login', UserController.login);

// Protected routes (require authentication)
router.get('/', UserController.listUsers);
router.post('/', UserController.createUser);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
