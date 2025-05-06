import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';

export const useWarehouses = (isAuthenticated, view, apiUrl) => {
  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/api/warehouses`); // Added /api
      return res.data;
    },
    enabled: isAuthenticated && view === 'warehouses',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data: warehouseQuantities = [], error: warehouseQuantitiesError, isLoading: warehouseQuantitiesLoading } = useQuery({
    queryKey: ['warehouseQuantities'],
    queryFn: async () => {
      // Assuming the route is /api/warehouses/quantities
      const res = await axios.get(`${apiUrl}/api/warehouses/quantities`); // Added /api and adjusted path
      return res.data;
    },
    enabled: isAuthenticated && view === 'warehouses',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => {
      console.error('Error fetching warehouse quantities:', err);
      message.error(`Failed to fetch warehouse quantities: ${err.response?.data?.message || err.message}`);
    },
  });

  return { warehousesData, warehousesLoading, warehouseQuantities, warehouseQuantitiesError, warehouseQuantitiesLoading };
};