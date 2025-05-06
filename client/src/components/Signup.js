import React, { useState } from 'react';
import { Input, Button, message, Card, Row, Col, Switch, Select } from 'antd'; // Import Select
import { StockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select; // Destructure Option from Select

const Signup = () => {
  const [theme, setTheme] = useState('light'); // Default to light theme
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer'); // Add state for role, default to 'viewer'
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSignup = async () => {
    if (!username || !password) {
      message.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      // Corrected API endpoint
      await axios.post(`${apiUrl}/api/auth/register`, { username, password, role }); // Send selected role
      message.success(`Account created successfully with role: ${role}. Please log in.`);
    } catch (err) {
      message.error('Signup failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-container"
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? 'linear-gradient(135deg, #1f1f1f, #2f2f2f)' : 'linear-gradient(135deg, #4fc3f7, #ffffff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Switch
          checked={theme === 'dark'}
          onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          checkedChildren="Dark Mode"
          unCheckedChildren="Light Mode"
        />
      </div>
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <StockOutlined style={{ fontSize: '36px', color: theme === 'dark' ? '#1890ff' : '#096dd9' }} />
            <h2 style={{ margin: '10px 0 0', color: theme === 'dark' ? '#fff' : '#000' }}>Welcome To Easy Stock</h2>
          </div>
        }
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          background: theme === 'dark' ? '#2f2f2f' : '#fff',
        }}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="large"
              style={{ borderRadius: '4px' }}
            />
          </Col>
          <Col span={24}>
            <Input.Password
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="large"
              iconRender={(visible) => (visible ? <span>👁️</span> : <span>👁️‍🗨️</span>)}
              style={{ borderRadius: '4px' }}
            />
          </Col>
          {/* Replaced Input with Select for Role */}
          <Col span={24}>
            <Select
              value={role}
              onChange={(value) => setRole(value)} // Select passes the value directly
              size="large"
              style={{ width: '100%', borderRadius: '4px' }}
              placeholder="Select Role"
            >
              <Option value="viewer">Viewer</Option>
              <Option value="admin">Admin</Option>
              {/* You could add 'manager' here too if needed */}
              {/* <Option value="manager">Manager</Option> */}
            </Select>
          </Col>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSignup}
              loading={loading}
              style={{
                width: '100%',
                background: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '4px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#096dd9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
            >
              Sign Up
            </Button>
          </Col>
          <Col span={24} style={{ textAlign: 'center' }}>
            <span style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: theme === 'dark' ? '#40a9ff' : '#1890ff' }}>
                Log In
              </a>
            </span>
          </Col>
          <Col span={24} style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
            <small>Need help? Contact support@abhijitgyan121@gmail.com</small>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Signup;