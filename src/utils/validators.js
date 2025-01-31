export const validateCategory = (categoryData) => {
  const errors = [];

  // Title validation
  if (!categoryData.title || categoryData.title.trim() === '') {
    errors.push('Title is required and cannot be empty');
  }

  // Slug validation
  if (categoryData.slug && !/^[a-z0-9-]+$/.test(categoryData.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  // Keywords validation
  if (categoryData.keywords && !Array.isArray(categoryData.keywords)) {
    errors.push('Keywords must be an array');
  }

  // Domain count validation
  if (categoryData.domain_count && (typeof categoryData.domain_count !== 'number' || categoryData.domain_count < 0)) {
    errors.push('Domain count must be a non-negative number');
  }

  // Sort order validation
  if (categoryData.sort_order && (typeof categoryData.sort_order !== 'number')) {
    errors.push('Sort order must be a number');
  }

  // Parent ID validation
  if (categoryData.parent_id && (typeof categoryData.parent_id !== 'number' || categoryData.parent_id < 0)) {
    errors.push('Parent ID must be a non-negative number');
  }

  // Meta title length validation
  if (categoryData.meta_title && categoryData.meta_title.length > 60) {
    errors.push('Meta title must be 60 characters or less');
  }

  // Meta description length validation
  if (categoryData.meta_description && categoryData.meta_description.length > 160) {
    errors.push('Meta description must be 160 characters or less');
  }

  return errors;
};
