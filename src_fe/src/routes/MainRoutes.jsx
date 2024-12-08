import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from '../layout/Dashboard';
import Loadable from '../components/Loadable';

// pages routing
const Dashboard = Loadable(lazy(() => import('../pages/dashboard')));
const ChangePassword = Loadable(lazy(() => import('../pages/authentication/ChangePassword')));
const Products = Loadable(lazy(() => import('../pages/Products')));
const Employees = Loadable(lazy(() => import('../pages/Employees')));
const EmployeeProfile = Loadable(lazy(() => import('../pages/EmployeeProfile')));
const MyProfile = Loadable(lazy(() => import('../pages/MyProfile')));
const Cards = Loadable(lazy(() => import('../pages/Cards')));
const Checkout = Loadable(lazy(() => import('../pages/Checkout')));
const Customers = Loadable(lazy(() => import('../pages/Customers')));
const CustomerDetail = Loadable(lazy(() => import('../pages/CustomerDetail')));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Navigate to="/login" replace />
    },
    {
      path: 'dashboard',
      element: <Dashboard />
    },
    {
      path: 'change-password',
      element: <ChangePassword />
    },
    {
      path: 'products',
      element: <Products />
    },
    {
      path: 'employees',
      element: <Employees />
    },
    {
      path: 'employee/:id',
      element: <EmployeeProfile />
    },
    {
      path: 'my-profile',
      element: <MyProfile />
    },
    {
      path: 'cards',
      element: <Cards />
    },
    {
      path: 'checkout',
      element: <Checkout />
    },
    {
      path: 'customers',
      element: <Customers />
    },
    {
      path: 'customer/:phone',
      element: <CustomerDetail />
    }
  ]
};

export default MainRoutes;
