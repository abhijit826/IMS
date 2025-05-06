import React from 'react';
import { Layout, Typography, Button, Menu, Avatar, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
  AreaChartOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  NumberOutlined,
  PieChartOutlined,
  BankOutlined,
  RiseOutlined,
  LineChartOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { themeStyles } from '../constants/themeStyles';
import { useTheme } from '../context/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Define menu items with inventory-specific Ant Design icons
const menuItems = [
  { key: 'dashboard', icon: <HomeOutlined style={{ color: '#fff5e6' }} />, label: 'Dashboard' },
  { key: 'table', icon: <UnorderedListOutlined style={{ color: '#fff5e6' }} />, label: 'Inventory Items' },
  { key: 'bar', icon: <NumberOutlined style={{ color: '#fff5e6' }} />, label: 'Quantity' },
  { key: 'pie', icon: <PieChartOutlined style={{ color: '#fff5e6' }} />, label: 'Stock Status' },
  { key: 'warehouses', icon: <BankOutlined style={{ color: '#fff5e6' }} />, label: 'Warehouses' },
  { key: 'analytics', icon: <AreaChartOutlined style={{ color: '#fff5e6' }} />, label: 'Analytics' },
  { key: 'forecasting', icon: <RiseOutlined style={{ color: '#fff5e6' }} />, label: 'Forecasting' },
  { key: 'viewerForecasting', icon: <AreaChartOutlined style={{ color: '#fff5e6' }} />, label: 'Viewer Forecasting' },
];

// Handle menu click events
const handleMenuClick = (e, setView, handleLogout) => {
  if (e.key === 'logout') {
    handleLogout();
  } else {
    setView(e.key);
  }
};

const AppLayout = ({
  children,
  collapsed,
  setCollapsed,
  setView,
  handleLogout,
  userRole,
  view,
}) => {
  const { theme, toggleTheme } = useTheme();
  const toggleCollapse = () => setCollapsed(!collapsed);

  const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';

  const profileMenu = {
    items: [
      {
        key: 'logout',
        label: 'Logout',
        icon: <PoweroffOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.key === 'bar' || item.key === 'pie' || item.key === 'forecasting' || item.key === 'line' || item.key === 'analytics') {
      return userRole !== 'viewer';
    }
    if (item.key === 'viewerForecasting') {
      return userRole === 'viewer';
    }
    return true;
  });

  // Update the header title based on the view
  const getHeaderTitle = () => {
    switch (view) {
      case 'dashboard':
        return 'Dashboard';
      case 'table':
        return userRole === 'viewer' ? 'Inventory Items' : 'Inventory Management';
      case 'bar':
        return 'Quantity by Warehouse';
      case 'pie':
        return 'Stock Status Distribution';
      case 'warehouses':
        return 'Warehouse Management';
      case 'analytics':
        return 'Analytics';
      case 'forecasting':
        return userRole === 'viewer' ? 'Inventory Forecasting (Viewer)' : 'Inventory Forecasting';
      default:
        return 'Inventory Management';
    }
  };

  // Define orange-yellow gradient backgrounds based on theme
  const backgroundGradient = theme === 'light'
    ? 'linear-gradient(135deg, #ff8c00 0%, #ffd700 100%)'
    : 'linear-gradient(135deg, #cc7000 0%, #b39b00 100%)';

  const siderBackground = theme === 'light'
    ? 'linear-gradient(135deg, rgba(255, 140, 0, 0.95) 0%, rgba(255, 215, 0, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(204, 112, 0, 0.95) 0%, rgba(179, 155, 0, 0.95) 100%)';

  const headerBackground = theme === 'light'
    ? 'linear-gradient(135deg, rgba(255, 140, 0, 0.85) 0%, rgba(255, 255, 255, 0.85) 100%)'
    : 'linear-gradient(135deg, rgba(228, 224, 220, 0.85) 0%, rgba(225, 204, 83, 0.85) 100%)';

  // Define text colors for menu items
  const menuTextColor = theme === 'light' ? '#fff5e6' : '#e6d9c2';

  return (
    <Layout style={{ minHeight: '100vh', background: backgroundGradient }}>
      <Sider
        width={200}
        collapsed={collapsed || window.innerWidth < 768}
        collapsible
        trigger={null}
        style={{ background: siderBackground }}
      >
        <div style={{ padding: collapsed ? '16px 8px' : '16px', textAlign: 'center' }}>
          <LineChartOutlined style={{ color: '#fff', fontSize: '40px' }} />
          {!collapsed && (
            <Title
              level={3}
              style={{ color: '#fff', margin: '8px 0 0', fontSize: '24px' }}
            >
              Easy Stock
            </Title>
          )}
        </div>
        <Menu
          theme={theme === 'light' ? 'light' : 'dark'}
          mode="inline"
          selectedKeys={[view]}
          onClick={(e) => handleMenuClick(e, setView, handleLogout)}
          style={{ background: 'transparent' }}
          items={filteredMenuItems.map(item => ({
            ...item,
            label: (
              <span
                style={{
                  color: menuTextColor,
                  fontWeight: '500',
                }}
              >
                {item.label}
              </span>
            ),
          }))}
          className="custom-menu"
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: headerBackground,
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{
              fontSize: '26px',
              color: '#fff',
              display: window.innerWidth >= 768 ? 'block' : 'none',
            }}
          />
          <Title level={2} style={{ color: '#e65100', margin: 0, fontSize: '28px' }}>
            {getHeaderTitle()}
          </Title>
          <Dropdown menu={profileMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: theme === 'light' ? '#ff8c00' : '#cc7000' }}
              />
              <Text style={{ color: '#ffca28', fontSize: '16px' }}>
                {displayRole}
              </Text>
              <DownOutlined style={{ color: '#ffca28', fontSize: '12px' }} />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: '24px', minWidth: window.innerWidth < 768 ? '100%' : 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

// Add custom CSS for hover and selected effects
const styles = `
  .custom-menu .ant-menu-item {
    transition: transform 0.3s ease, filter 0.3s ease;
  }
  .custom-menu .ant-menu-item:hover {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
  .custom-menu .ant-menu-item-selected {
    transform: scale(1.1);
    filter: brightness(1.3);
    background-color: transparent !important;
  }
  .custom-menu .ant-menu-item-selected::after {
    border-right: none !important;
  }
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AppLayout;