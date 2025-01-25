import express from 'express';
import * as DomainController from '../controllers/domainController.js';

const router = express.Router();

/**
 * @swagger
 * /api/domains:
 *   post:
 *     summary: Create a new domain
 *     tags: [Domains]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Domain'
 *     responses:
 *       201:
 *         description: Domain created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', DomainController.createDomain);

/**
 * @swagger
 * /api/domains:
 *   get:
 *     summary: Get all domains with optional filtering
 *     tags: [Domains]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of domains
 *       500:
 *         description: Server error
 */
router.get('/', DomainController.getAllDomains);

/**
 * @swagger
 * /api/domains/search:
 *   get:
 *     summary: Search domains by query
 *     tags: [Domains]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching domains
 *       400:
 *         description: Missing search query
 */
router.get('/search', DomainController.searchDomains);

/**
 * @swagger
 * /api/domains/{id}:
 *   get:
 *     summary: Get domain by ID
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain details
 *       404:
 *         description: Domain not found
 */
router.get('/:id', DomainController.getDomainById);

/**
 * @swagger
 * /api/domains/{id}/recommend:
 *   get:
 *     summary: Get recommended domains similar to the given domain
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of recommended domains
 *       500:
 *         description: Server error
 */
router.get('/:id/recommend', DomainController.recommendDomains);

/**
 * @swagger
 * /api/domains/{id}:
 *   patch:
 *     summary: Update a domain
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Domain'
 *     responses:
 *       200:
 *         description: Domain updated successfully
 *       400:
 *         description: Bad request
 */
router.patch('/:id', DomainController.patchDomain);

/**
 * @swagger
 * /api/domains/{id}:
 *   delete:
 *     summary: Delete a domain
 *     tags: [Domains]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Domain deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:id', DomainController.deleteDomain);

export default router;
