// frontend/src/context/ResourceContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { resourcesAPI } from '../api/resources';

const ResourceContext = createContext(null);

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

export function ResourceProvider({ children }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    ordering: '-created_at',
  });

  const fetchResources = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        page_size: 12,
        ordering: filters.ordering,
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const response = await resourcesAPI.getResources(params);
      const data = response.data;

      if (append) {
        setResources(prev => [...prev, ...(data.results || data)]);
      } else {
        setResources(data.results || data);
      }

      setPagination({
        page: data.page || page,
        totalPages: data.total_pages || 1,
        totalCount: data.count || (data.results || data).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createResource = async (resourceData) => {
    try {
      const response = await resourcesAPI.createResource(resourceData);
      setResources(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create resource';
      return { success: false, error: message };
    }
  };

  const updateResource = async (id, resourceData) => {
    try {
      const response = await resourcesAPI.updateResource(id, resourceData);
      setResources(prev => prev.map(r => r.id === id ? response.data : r));
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update resource';
      return { success: false, error: message };
    }
  };

  const deleteResource = async (id) => {
    try {
      await resourcesAPI.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete resource';
      return { success: false, error: message };
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const value = {
    resources,
    loading,
    error,
    pagination,
    filters,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    updateFilters,
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
}