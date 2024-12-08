// assets
import { LoginOutlined, ProfileOutlined, MailOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  MailOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
  id: 'authentication',
  title: 'Authentication',
  type: 'group',
  children: [
    {
      id: 'login1',
      title: 'Login',
      type: 'item',
      url: '/login',
      icon: icons.LoginOutlined,
      target: true
    },
    {
      id: 'register1',
      title: 'Register',
      type: 'item',
      url: '/register',
      icon: icons.ProfileOutlined,
      target: true
    },
    {
      id: 'resend-password',
      title: 'Resend Email',
      type: 'item',
      url: '/resend-password',
      icon: icons.MailOutlined,
      target: true
    }
  ]
};

export default pages;
