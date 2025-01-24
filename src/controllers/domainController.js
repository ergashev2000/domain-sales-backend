const Domain = require('../models/Domain');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.createDomain = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    
    const domain = await Domain.create({
      name,
      price,
      description,
      userId: req.user.id
    });

    res.status(201).json(domain);
  } catch (error) {
    logger.error('Domain creation error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getDomains = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      minPrice, 
      maxPrice, 
      status 
    } = req.query;

    const whereCondition = {
      ...(search && { 
        name: { 
          [Op.iLike]: `%${search}%` 
        } 
      }),
      ...(minPrice && { price: { [Op.gte]: minPrice } }),
      ...(maxPrice && { price: { [Op.lte]: maxPrice } }),
      ...(status && { status })
    };

    const domains = await Domain.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      domains: domains.rows,
      totalPages: Math.ceil(domains.count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Get domains error:', error);
    res.status(500).json({ error: 'Server error retrieving domains' });
  }
};

exports.getDomainById = async (req, res) => {
  try {
    const domain = await Domain.findByPk(req.params.id);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json(domain);
  } catch (error) {
    logger.error('Get domain by ID error:', error);
    res.status(500).json({ error: 'Server error retrieving domain' });
  }
};

exports.updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, status, description } = req.body;

    const domain = await Domain.findByPk(id);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Only allow owner or admin to update
    if (domain.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this domain' });
    }

    await domain.update({ price, status, description });
    res.json(domain);
  } catch (error) {
    logger.error('Domain update error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findByPk(id);

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Only allow owner or admin to delete
    if (domain.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this domain' });
    }

    await domain.destroy();
    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    logger.error('Domain deletion error:', error);
    res.status(500).json({ error: 'Server error deleting domain' });
  }
};
