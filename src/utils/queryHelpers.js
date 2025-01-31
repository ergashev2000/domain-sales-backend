import { Op } from 'sequelize';

/**
 * Safely parse and validate numeric filter values
 * @param {*} value - Input value to parse
 * @param {Object} options - Validation options
 * @returns {number|null} Parsed number or null
 */
export const parseNumericFilter = (value, options = {}) => {
  const {
    defaultValue = null,
    min = -Infinity,
    max = Infinity,
    required = false
  } = options;

  // Handle null or undefined
  if (value === null || value === undefined) {
    return required ? defaultValue : null;
  }

  // Convert to number
  const parsedValue = Number(value);

  // Check if parsing was successful
  if (isNaN(parsedValue)) {
    return required ? defaultValue : null;
  }

  // Apply min/max constraints
  if (parsedValue < min || parsedValue > max) {
    return required ? defaultValue : null;
  }

  return parsedValue;
};

/**
 * Build a safe where condition for numeric filtering
 * @param {string} field - Database field name
 * @param {*} minValue - Minimum value
 * @param {*} maxValue - Maximum value
 * @returns {Object} Sequelize where condition
 */
export const buildNumericFilter = (field, minValue, maxValue) => {
  const conditions = {};

  const parsedMin = parseNumericFilter(minValue, { min: 0 });
  const parsedMax = parseNumericFilter(maxValue, { min: 0 });

  if (parsedMin !== null) {
    conditions[Op.gte] = parsedMin;
  }

  if (parsedMax !== null) {
    conditions[Op.lte] = parsedMax;
  }

  return Object.keys(conditions).length > 0 
    ? { [field]: conditions } 
    : {};
};

/**
 * Build a safe where condition for text-based filtering
 * @param {string} field - Database field name
 * @param {string} value - Filter value
 * @returns {Object} Sequelize where condition
 */
export const buildTextFilter = (field, value) => {
  if (!value || typeof value !== 'string') return {};

  return {
    [field]: {
      [Op.iLike]: `%${value.trim()}%`
    }
  };
};

/**
 * Merge multiple where conditions safely
 * @param {...Object} conditions - Conditions to merge
 * @returns {Object} Merged conditions
 */
export const mergeConditions = (...conditions) => {
  return conditions.reduce((acc, condition) => ({
    ...acc,
    ...condition
  }), {});
};
