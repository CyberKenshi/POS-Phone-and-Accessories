import PropTypes from 'prop-types';

import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from 'api/auth/auth';

// material-ui

import List from '@mui/material/List';

import ListItemButton from '@mui/material/ListItemButton';

import ListItemIcon from '@mui/material/ListItemIcon';

import ListItemText from '@mui/material/ListItemText';

// assets

import EditOutlined from '@ant-design/icons/EditOutlined';

import ProfileOutlined from '@ant-design/icons/ProfileOutlined';

import LogoutOutlined from '@ant-design/icons/LogoutOutlined';

import UserOutlined from '@ant-design/icons/UserOutlined';

import WalletOutlined from '@ant-design/icons/WalletOutlined';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (event, index, path) => {
    setSelectedIndex(index);

    if (path) {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await logout();

    navigate('/login');
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1, '/my-profile')}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>

        <ListItemText primary="View Profile" />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0, '/change-password')}>
        <ListItemIcon>
          <EditOutlined />
        </ListItemIcon>

        <ListItemText primary="Change Password" />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>

        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
