const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, domainController.createDomain);
router.get('/', domainController.getDomains);
router.get('/:id', domainController.getDomainById);
router.patch('/:id', authMiddleware, domainController.updateDomain);
router.delete('/:id', authMiddleware, domainController.deleteDomain);

module.exports = router;
