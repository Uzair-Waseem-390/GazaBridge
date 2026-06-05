/**
 * Pagination Utilities
 * Standardizes pagination data extraction from backend responses
 */

/**
 * Extract pagination info from backend response
 * Handles multiple response formats from different API endpoints
 * 
 * @param {Object} response - Backend API response data
 * @param {number} currentPage - Current page number (fallback)
 * @returns {Object} - Normalized pagination data
 */
export const extractPaginationInfo = (response, currentPage = 1) => {
  return {
    page: response.page || currentPage,
    totalPages: response.total_pages || 1,
    totalCount: response.count || 0,
    results: response.results || response,
    next: response.next || null,
    previous: response.previous || null,
  };
};

/**
 * Extract pagination from nested structure (some endpoints use data.pagination)
 * 
 * @param {Object} response - Backend API response
 * @param {number} currentPage - Current page number (fallback)
 * @returns {Object} - Normalized pagination data
 */
export const extractNestedPaginationInfo = (response, currentPage = 1) => {
  const pagination = response.pagination || {};
  return {
    page: pagination.page || response.page || currentPage,
    totalPages: pagination.total_pages || response.total_pages || 1,
    totalCount: pagination.count || response.count || 0,
    results: response.results || response,
    next: response.next || null,
    previous: response.previous || null,
  };
};

/**
 * Calculate if there are more pages
 */
export const hasMorePages = (currentPage, totalPages) => {
  return currentPage < totalPages;
};

/**
 * Build page query params
 */
export const buildPageParams = (page = 1, pageSize = 12, additionalParams = {}) => {
  return {
    page,
    page_size: pageSize,
    ...additionalParams,
  };
};

/**
 * Prepare API params with pagination and filters
 */
export const buildApiParams = (page, pageSize, filters = {}) => {
  const params = buildPageParams(page, pageSize);
  
  // Add non-empty filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value;
    }
  });
  
  return params;
};

/**
 * Merge pagination data with existing items (for "load more" pattern)
 */
export const appendPaginationResults = (existingItems, newResults) => {
  return [...existingItems, ...(newResults || [])];
};
