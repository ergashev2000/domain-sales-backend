import express from 'express';
import * as GoogleAuthController from '../controllers/googleAuthController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/google/login:
 *   post:
 *     summary: Authenticate with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Successful Google authentication
 *       400:
 *         description: Authentication failed
 */
router.post('/login', GoogleAuthController.googleLogin);

/**
 * @swagger
 * /api/auth/google/callback:
 *   post:
 *     summary: Google OAuth callback endpoint
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       302:
 *         description: Redirect to client with access token
 *       400:
 *         description: Authentication failed
 */
router.post('/callback', GoogleAuthController.googleCallback);

export default router;
