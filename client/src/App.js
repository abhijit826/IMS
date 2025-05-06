import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { message } from 'antd';
import { message, Spin } from 'antd'; // Import Spin
import Login from './components/Login';
import Signup from './components/Signup';
import AppLayout from './components/AppLayout';
import ContentView from './components/ContentView';
import WarehouseModal from './components/WarehouseModal';
import TransferModal from './components/TransferModal';
import ItemsModal from './components/ItemsModal';
import ItemDetailsModal from './components/ItemDetailsModal';
import Forecasting from './components/Forecasting';
import ForgotPassword from './components/ForgotPassword';
import { useAuth } from './hooks/useAuth';
import { useItems } from './hooks/useItems';
import { useWarehouses } from './hooks/useWarehouses';
import { useWarehouseItems } from './hooks/useWarehouseItems';
import { useCharts } from './hooks/useCharts';
import { useMutations } from './hooks/useMutations';
import { useModals } from './hooks/useModals';
import { itemsPerPage, apiUrl } from './constants/config';
// import { itemColumns } from './constants/columns';
import { itemColumns } from './constants/columns'; // Keep if needed by ItemsModal
import { useTheme } from './context/ThemeContext'; // Import useTheme
import './App.css';
import axios from 'axios';

function App() {
  const [view, setView] = useState('table');
  // const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);

  // Authentication
  const { isAuthenticated, userRole, handleLogin, handleLogout } = useAuth();

  // Hooks must be called unconditionally
  const modals = useModals();
  const { theme } = useTheme(); // Get theme from context
  const {
    itemsData,
    isLoading,
    currentPage,
    localSearchTerm,
    filters,
    handleSearchChange,
    handleSort,
    handleFilterChange,
    setSearchTerm,
    handlePageChange,
  } = useItems(isAuthenticated, view, apiUrl, itemsPerPage);

  const {
    warehousesData,
    warehousesLoading,
    warehouseQuantities,
    warehouseQuantitiesError,
    warehouseQuantitiesLoading,
  } = useWarehouses(isAuthenticated, view, apiUrl);

  const { warehouseItems, warehouseItemsLoading, warehouseItemsError } = useWarehouseItems(
    isAuthenticated,
    modals.selectedWarehouse,
    modals.isItemsModalVisible,
    apiUrl
  );

  const { barData, barLoading, barError, pieData, pieLoading, pieError } = useCharts(isAuthenticated, view, apiUrl);

  const {
    addMutation,
    updateMutation,
    deleteMutation,
    transferMutation,
    warehouseMutation,
    deleteWarehouseMutation,
    logMutation,
  } = useMutations(apiUrl, view, itemsPerPage, currentPage, localSearchTerm, 'name', 'asc', filters);


  // Modified filter handler for chart clicks
  const handleFilterChangeModified = useCallback((filterInput) => {
    // Check if it's a standard event object from an input field
    if (filterInput && filterInput.target) {
      handleFilterChange(filterInput); // Call the original handler from useItems
    }
    // Check if it's the object passed from ItemChart
    else if (filterInput && typeof filterInput === 'object') {
      const filterKey = Object.keys(filterInput)[0]; // e.g., 'warehouse' or 'status'
      const filterValue = filterInput[filterKey];   // e.g., 'WH1' or 'lowStock'

      // Apply filter logic - Example: Set main search term
      if (filterKey === 'warehouse') {
        setSearchTerm(filterValue); // Filter by warehouse name
      } else if (filterKey === 'status') {
        setSearchTerm(filterValue === 'lowStock' ? 'low stock' : ''); // Filter by 'low stock' or clear
      }
      // Reset page when chart filter is applied
      handlePageChange(1);
    } else {
      console.warn("Unhandled filter input type:", filterInput);
    }
  }, [handleFilterChange, handlePageChange, setSearchTerm]); // Add dependencies

  // Low Stock Check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLowStock = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/items/low-stock-alert`); // Added /api
        // if (res.data.length > 0) {
           // Only show warning if there are actually low stock items *and* the user can see the table
        // Avoid showing during initial load or on dashboard/other views if desired
        if (res.data.length > 0 && view === 'table') {
          message.warning(`Low stock on: ${res.data.map(item => item.name).join(', ')}`, 5);
        }
      } catch (err) {
        console.error('Low stock check failed:', err);
      }
    };
    const interval = setInterval(checkLowStock, 300000);
    return () => clearInterval(interval);
  // }, [isAuthenticated]);

  // // Log Mutations
  // useEffect(() => {
  //   if (!isAuthenticated) return;

  //   const logAction = (action, itemId) => {
  //     logMutation.mutate({ action, itemId, user: localStorage.getItem('userId') || 'anonymous', timestamp: new Date() });
  //   };
  //   const originalAdd = addMutation.mutate;
  //   const originalUpdate = updateMutation.mutate;
  //   const originalDelete = deleteMutation.mutate;
  //   addMutation.mutate = (values) => {
  //     logAction('add', values._id);
  //     originalAdd(values);
  //   };
  //   updateMutation.mutate = (args) => {
  //     logAction('update', args.id);
  //     originalUpdate(args);
  //   };
  //   deleteMutation.mutate = (id) => {
  //     logAction('delete', id);
  //     originalDelete(id);
  //   };
  //   return () => {
  //     addMutation.mutate = originalAdd;
  //     updateMutation.mutate = originalUpdate;
  //     deleteMutation.mutate = originalDelete;
  //   };
  // }, [isAuthenticated, addMutation, updateMutation, deleteMutation, logMutation]);
}, [isAuthenticated, apiUrl, view]);
  const handleAdd = useCallback((values) => addMutation.mutate(values), [addMutation]);
  const handleUpdate = useCallback((id, updatedItem) => updateMutation.mutate({ id, updatedItem }), [updateMutation]);
  const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation]);

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canViewCharts = userRole !== 'viewer';

  const items = itemsData?.items || [];
  const totalItems = itemsData?.totalItems || 0;
  const warehouses = warehousesData || [];
  // More robust loading state check
  if (isLoading && !isAuthenticated) { // Show loading only during initial auth check/load
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
 }
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          {/* <Route path="/forgot-password" element={<ForgotPassword theme="light" />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppLayout
        // theme={theme}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setView={setView}
        handleLogout={handleLogout}
        userRole={userRole}
        view={view}
        // toggleTheme={toggleTheme}
      >
        <ContentView
          view={view}
          theme={theme}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          userRole={userRole}
          itemsData={itemsData}
          items={items}
          totalItems={totalItems}
          currentPage={currentPage}
          localSearchTerm={localSearchTerm}
          filters={filters}
          handleSearchChange={handleSearchChange}
          // handleFilterChange={handleFilterChange}
          handleFilterChange={handleFilterChangeModified}
          handlePageChange={handlePageChange}
          handleSort={handleSort}
          handleAdd={handleAdd}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          handleTransfer={modals.handleTransfer}
          handleViewItem={modals.handleViewItem}
          canEdit={canEdit}
          canViewCharts={canViewCharts}
          barData={barData}
          barLoading={barLoading}
          barError={barError}
          pieData={pieData}
          pieLoading={pieLoading}
          pieError={pieError}
          warehouses={warehouses}
          warehousesLoading={warehousesLoading}
          warehouseQuantities={warehouseQuantities}
          warehouseQuantitiesLoading={warehouseQuantitiesLoading}
          warehouseQuantitiesError={warehouseQuantitiesError}
          showWarehouseModal={modals.showWarehouseModal}
          deleteWarehouseMutation={deleteWarehouseMutation}
          handleViewItems={modals.handleViewItems}
          apiUrl={apiUrl}
          ForecastingComponent={Forecasting}
          setView={setView}
        />
        <WarehouseModal
          isVisible={modals.isWarehouseModalVisible}
          onOk={() => modals.handleWarehouseOk(warehouseMutation)}
          onCancel={modals.handleWarehouseCancel}
          warehouseForm={modals.warehouseForm}
          title={modals.warehouseModalTitle}
        />
        <TransferModal
          isVisible={modals.isTransferModalVisible}
          onOk={() => modals.handleTransferOk(transferMutation)}
          onCancel={modals.handleTransferCancel}
          transferForm={modals.transferForm}
          items={items}
          selectedItemId={modals.selectedItemId}
          warehouses={warehouses}
          isAuthenticated={isAuthenticated}
        />
        <ItemsModal
          isVisible={modals.isItemsModalVisible}
          onCancel={modals.handleItemsModalCancel}
          selectedWarehouse={modals.selectedWarehouse}
          warehouseItems={warehouseItems}
          warehouseItemsLoading={warehouseItemsLoading}
          warehouseItemsError={warehouseItemsError}
          itemColumns={itemColumns}
          canEdit={canEdit}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          handleTransfer={modals.handleTransfer}
        />
        <ItemDetailsModal
          isVisible={modals.isItemDetailsModalVisible}
          onCancel={modals.handleItemDetailsModalCancel}
          selectedItem={modals.selectedItem}
          warehouses={warehouses}
        />
      </AppLayout>
    </Router>
  );
}

export default App;