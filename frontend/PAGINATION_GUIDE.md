# Pagination Implementation Guide

## Overview
Fixed pagination support across all list pages in the GazaBridge frontend. The backend now properly provides pagination data (count, page, total_pages) and the frontend is handling it correctly.

## Files Created

### 1. `src/components/Pagination.jsx` - Reusable Pagination Component
A flexible component supporting two styles:

#### "Load More" Style (for infinite scroll)
```jsx
import Pagination from '../components/Pagination';

<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  totalCount={pagination.totalCount}
  currentCount={items.length}
  loading={loading}
  onLoadMore={() => fetchItems(pagination.page + 1, true)}
  style="loadmore"
/>
```

#### "Prev/Next" Style (for paginated navigation)
```jsx
<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  loading={loading}
  onPrevPage={() => fetchItems(pagination.page - 1)}
  onNextPage={() => fetchItems(pagination.page + 1)}
  style="nav"
/>
```

### 2. `src/utils/paginationUtils.js` - Helper Functions
Standardized utilities for pagination handling:

```javascript
import {
  extractPaginationInfo,
  extractNestedPaginationInfo,
  hasMorePages,
  buildPageParams,
  buildApiParams,
  appendPaginationResults,
} from '../utils/paginationUtils';

// Extract pagination from flat response
const paginationData = extractPaginationInfo(response.data, currentPage);
// Returns: { page, totalPages, totalCount, results, next, previous }

// Check if more pages exist
if (hasMorePages(currentPage, totalPages)) {
  // Enable load more button
}

// Build standardized page params
const params = buildPageParams(page, pageSize, additionalParams);

// Build params with filters
const params = buildApiParams(page, 12, { category: 'tech', search: 'react' });
```

## Updated Pages

### Frontend Pages (Load More Pattern)
- `src/pages/Courses.jsx` - 12 items per page
- `src/pages/Posts.jsx` - 12 items per page
- `src/pages/Resources.jsx` - 12 items per page (via ResourceContext)
- `src/pages/LiveSections.jsx` - 12 items per page

### Admin Pages (Prev/Next Pattern)
- `src/pages/admin/AdminCourses.jsx` - 12 items per page
- `src/pages/admin/AdminPosts.jsx` - 20 items per page
- `src/pages/admin/AdminLiveSections.jsx` - 20 items per page
- `src/pages/admin/AdminResources.jsx` - 20 items per page

### Context-based Pages
- `src/context/ResourceContext.jsx` - Resource pagination management
- `src/context/NotificationContext.jsx` - Notification pagination with polling

## Expected Backend Response Format

All list endpoints should return:
```json
{
  "count": 100,                    // Total items in database
  "next": "http://api/courses/?page=2",
  "previous": null,
  "page": 1,                       // Current page number
  "total_pages": 5,                // Total number of pages
  "results": [                     // Items on this page
    { "id": 1, "title": "Item 1" },
    { "id": 2, "title": "Item 2" }
  ]
}
```

## Standardized Pagination State

All pages now use consistent pagination state:
```javascript
const [pagination, setPagination] = useState({
  page: 1,                    // Current page number
  totalPages: 1,              // Total pages available
  totalCount: 0,              // Total items in database
});
```

## Implementation Pattern for New Pages

### 1. Import Utilities
```javascript
import Pagination from '../components/Pagination';
import { buildApiParams } from '../utils/paginationUtils';
```

### 2. Initialize State
```javascript
const [items, setItems] = useState([]);
const [pagination, setPagination] = useState({
  page: 1,
  totalPages: 1,
  totalCount: 0,
});
const [loading, setLoading] = useState(false);
const [filters, setFilters] = useState({ /* your filters */ });
```

### 3. Fetch Function
```javascript
const fetchItems = useCallback(async (page = 1, append = false) => {
  setLoading(true);
  try {
    const params = buildApiParams(page, 12, filters);
    const response = await yourAPI.getItems(params);
    const data = response.data;
    const results = data.results || data;

    if (append) {
      setItems(prev => [...prev, ...results]);
    } else {
      setItems(results);
    }

    setPagination({
      page: data.page || page,
      totalPages: data.total_pages || 1,
      totalCount: data.count || results.length,
    });
  } catch (err) {
    console.error('Error fetching items:', err);
  } finally {
    setLoading(false);
  }
}, [filters]);
```

### 4. Add Pagination Component
```jsx
{/* Items Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>

{/* Pagination */}
<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  totalCount={pagination.totalCount}
  currentCount={items.length}
  loading={loading}
  onLoadMore={() => fetchItems(pagination.page + 1, true)}
  style="loadmore"
/>
```

## Key Fixes Applied

1. **Consistent Data Extraction**
   - All pages now use `const results = data.results || data`
   - Ensures compatibility with both wrapped and unwrapped responses

2. **Standardized Pagination State**
   - All pages track `page`, `totalPages`, and `totalCount`
   - Enables proper display of pagination info

3. **Fixed LiveSections.jsx**
   - Now handles both `data.pagination` and flat structures
   - Prevents undefined errors on pagination data access

4. **Admin Pages Now Track Total Count**
   - Admins can see how many items exist in total
   - Useful for knowing if there are more pages

## Testing Checklist

- [ ] Navigate to each list page (Courses, Posts, Resources, LiveSections)
- [ ] Verify "Load More" button appears when there are multiple pages
- [ ] Click "Load More" and verify items append to list
- [ ] Test pagination with filters applied
- [ ] Verify pagination info updates correctly
- [ ] Check admin pages with prev/next pagination
- [ ] Test on mobile - ensure responsive layout
- [ ] Verify loading states show during fetch

## Backend API Requirements

Ensure your Django REST Framework endpoints return:
- `results` - List of items (or raw list)
- `count` - Total item count
- `page` - Current page number
- `total_pages` - Total number of pages
- `next` - URL to next page (optional)
- `previous` - URL to previous page (optional)

Use `PageNumberPagination` in Django settings:
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,  # Or 20 for admin pages
}
```

## Troubleshooting

**Problem**: Pagination shows wrong total count
- **Solution**: Ensure backend returns `count` field with total items

**Problem**: Load More button doesn't load new items
- **Solution**: Verify `append=true` is passed to fetch function

**Problem**: Pages don't show after first load
- **Solution**: Check that `total_pages` is calculated correctly on backend

**Problem**: Filters don't reset pagination
- **Solution**: Ensure `setPagination({ page: 1, ... })` when filters change

## Future Improvements

- Add URL-based pagination (`?page=2` in address bar)
- Implement cursor-based pagination for large datasets
- Add pagination presets (12, 25, 50 items per page)
- Cache pagination results client-side
