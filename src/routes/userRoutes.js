import express from 'express';
import { getUsers, getUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers); // Route to get all users
router.get('/:id', getUser); // Route to get user by ID

export default router;
