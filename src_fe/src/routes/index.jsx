import { createBrowserRouter } from 'react-router-dom';
import ErrorBoundary from 'components/ErrorBoundary';

// project import
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import ProductDetail from 'pages/ProductDetail';
import Products from 'pages/Products';
import Employees from 'pages/Employees';
import EmployeeProfile from 'pages/EmployeeProfile';

const router = createBrowserRouter(
  [
    {
      ...MainRoutes,
      errorElement: <ErrorBoundary />
    },
    LoginRoutes,
    {
      path: '/products',
      element: <Products />,
      errorElement: <ErrorBoundary />
    },
    {
      path: '/products/:id',
      element: <ProductDetail />,
      errorElement: <ErrorBoundary />
    },
    {
      path: '/employees',
      element: <Employees />,
      errorElement: <ErrorBoundary />
    },
    {
      path: '/employee/:id',
      element: <EmployeeProfile />,
      errorElement: <ErrorBoundary />
    }
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
