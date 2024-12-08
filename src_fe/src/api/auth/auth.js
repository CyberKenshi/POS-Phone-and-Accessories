import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../axios';
import { AUTH_ENDPOINTS } from '../endpoints';
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';

export const useAuth = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
      const { result, code, message } = response.data;

      if (code === 200 && result) {
        const { token, ...userData } = result;

        localStorage.setItem('token', token);

        dispatch({
          type: LOGIN,
          payload: {
            user: userData,
            token
          }
        });

        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        message: message || 'Đăng nhập thất bại'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: LOGOUT });
    }
  };

  return {
    login,
    logout,
    token
  };
};
