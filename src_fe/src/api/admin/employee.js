import axiosInstance from '../axios';
import { ADMIN_ENDPOINTS } from '../endpoints';

export const useEmployee = () => {
  // Lấy token từ localStorage thay vì Redux
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);

  const createEmployee = async (employeeData) => {
    try {
      const response = await axiosInstance.post(ADMIN_ENDPOINTS.CREATE_EMPLOYEE, employeeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { code, message, result } = response.data;

      if (code === 200) {
        return {
          success: true,
          data: result
        };
      }

      return {
        success: false,
        message: message || 'Tạo nhân viên thất bại'
      };
    } catch (error) {
      console.error('Create employee error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Tạo nhân viên thất bại'
      };
    }
  };

  return {
    createEmployee
  };
};
