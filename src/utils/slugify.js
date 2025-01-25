export default function slugify(text) {
  // Handle undefined, null, or non-string inputs
  if (text === undefined || text === null) {
    return '';
  }

  // Convert to string and process
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}
