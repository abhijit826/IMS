import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';

export const useMutations = (apiUrl, view, itemsPerPage, currentPage, searchTerm, sortBy, sortOrder, filters) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (values) => axios.post(`${apiUrl}/api/items`, values), // Corrected URL
    onSuccess: (res) => {
      if (view === 'table') {
        queryClient.setQueryData(['items', currentPage, searchTerm, sortBy, sortOrder, filters], (oldData) => {
          const newItems = [...(oldData?.items || []), res.data].slice(-itemsPerPage);
          return { ...oldData, items: newItems, totalItems: (oldData?.totalItems || 0) + 1 };
        });
      }
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['pieChart']);
      queryClient.invalidateQueries(['warehouseQuantities']);
      message.success('Item added successfully', 2);
    },
    onError: (err) => {
      message.error(`Failed to add item: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedItem }) => axios.put(`${apiUrl}/api/items/${id}`, updatedItem), // Added /api
    onSuccess: (res) => {
      if (view === 'table') {
        queryClient.setQueryData(['items', currentPage, searchTerm, sortBy, sortOrder, filters], (oldData) => {
          const newItems = oldData?.items.map(item => (item._id === res.data._id ? res.data : item)) || [];
          return { ...oldData, items: newItems };
        });
      }
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['pieChart']);
      queryClient.invalidateQueries(['warehouseQuantities']);
      message.success('Item updated', 2);
    },
    onError: (err) => {
      message.error(`Failed to update item: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${apiUrl}/api/items/${id}`), // Added /api
    onSuccess: (data, variables) => { // Corrected: Use variables to get the ID
      if (view === 'table') {
        queryClient.setQueryData(['items', currentPage, searchTerm, sortBy, sortOrder, filters], (oldData) => {
          // Use variables (the ID passed to mutate) for filtering
          const newItems = oldData?.items.filter(item => item._id !== variables) || [];
          return { ...oldData, items: newItems, totalItems: (oldData?.totalItems || 0) - 1 };
        });
      }
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['pieChart']);
      queryClient.invalidateQueries(['warehouseQuantities']);
      message.success('Item deleted', 2);
    },
    onError: (err) => {
      message.error(`Failed to delete item: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  const transferMutation = useMutation({
    mutationFn: async ({ itemId, fromWarehouse, toWarehouse, quantity }) => {
      const res = await axios.post(`${apiUrl}/api/items/transfer`, { itemId, fromWarehouse, toWarehouse, quantity }); // Added /api
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['warehouseQuantities']);
      message.success(
        `Transferred ${variables.quantity} units of ${data.itemName} from ${variables.fromWarehouse} to ${variables.toWarehouse}`,
        2
      );
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred';
      message.error(`Failed to transfer item: ${errorMessage}`, 2);
    },
  });

  const warehouseMutation = useMutation({
    mutationFn: async (values) => {
      if (values._id) {
        const res = await axios.put(`${apiUrl}/api/warehouses/${values._id}`, values); // Added /api
        return res.data;
      } else {
        const res = await axios.post(`${apiUrl}/api/warehouses`, values); // Added /api
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      message.success('Warehouse saved successfully', 2);
    },
    onError: (err) => {
      message.error(`Failed to save warehouse: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${apiUrl}/api/warehouses/${id}`); // Added /api
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      message.success('Warehouse deleted successfully', 2);
    },
    onError: (err) => {
      message.error(`Failed to delete warehouse: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  const logMutation = useMutation({
    mutationFn: (logData) => axios.post(`${apiUrl}/api/logs`, logData), // Added /api
    onError: (err) => console.error('Failed to log action:', err),
  });

  return {
    addMutation,
    updateMutation,
    deleteMutation,
    transferMutation,
    warehouseMutation,
    deleteWarehouseMutation,
    logMutation,
  };
};