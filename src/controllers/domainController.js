import * as DomainService from '../services/domainService.js';
import { createDomainWithCategory, createDefaultDomain } from '../services/domainCreationService.js';

export const createDomain = async (req, res) => {
  try {
    const domainData = req.body;

    if (!domainData.name) {
      return res.status(400).json({ 
        error: 'Domain name is required',
        requiredFields: ['name', 'category_name (optional)']
      });
    }

    const newDomain = await createDomainWithCategory(domainData);

    res.status(201).json({
      message: 'Domain created successfully',
      domain: newDomain
    });
  } catch (error) {
    console.error('Domain creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create domain', 
      details: error.message 
    });
  }
};

export const createDefaultDomainController = async (req, res) => {
  try {
    const defaultDomain = await createDefaultDomain();
    res.status(201).json({
      message: 'Default domain created successfully',
      domain: defaultDomain
    });
  } catch (error) {
    console.error('Default domain creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create default domain', 
      details: error.message 
    });
  }
};

export const getAllDomains = async (req, res) => {
  try {
    const { 
      status, 
      minPrice, 
      maxPrice, 
      category, 
      listingType, 
      search,
      page, 
      limit 
    } = req.query;

    const domains = await DomainService.getAllDomains({
      status, 
      minPrice: parseFloat(minPrice), 
      maxPrice: parseFloat(maxPrice), 
      category, 
      listingType, 
      search,
      page: page ? parseInt(page) : undefined, 
      limit: limit ? parseInt(limit) : undefined
    });

    if (Array.isArray(domains)) {
      res.json(domains);
    } else {
      res.json({
        domains: domains.domains,
        total: domains.total,
        page: domains.page,
        limit: domains.limit,
        totalPages: domains.totalPages
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDomainById = async (req, res) => {
  try {
    const domain = await DomainService.getDomainById(req.params.id);
    
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    await DomainService.updateDomain(domain.id, { 
      viewCount: (domain.viewCount || 0) + 1 
    });

    res.json(domain);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDomain = async (req, res) => {
  try {
    const domain = await DomainService.updateDomain(req.params.id, req.body);
    res.json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const patchDomain = async (req, res) => {
  try {
    const domain = await DomainService.patchDomain(req.params.id, req.body);
    res.json(domain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDomain = async (req, res) => {
  try {
    await DomainService.deleteDomain(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const searchDomains = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const domains = await DomainService.searchDomains(query);
    res.json(domains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const recommendDomains = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendedDomains = await DomainService.recommendDomains(id);
    res.json(recommendedDomains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
