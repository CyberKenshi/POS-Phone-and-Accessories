import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/authentication/login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/register')));
const ResetPassword = Loadable(lazy(() => import('pages/authentication/ResetPassword')));
const ResendPassword = Loadable(lazy(() => import('pages/ResendPassword')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <AuthRegister />
    },
    {
      path: '/reset-password/:loginToken',
      element: <ResetPassword />
    },
    {
      path: '/resend-password',
      element: <ResendPassword />
    }
  ]
};

export default LoginRoutes;
