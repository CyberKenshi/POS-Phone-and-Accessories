import axiosInstance from '../axios';
import { ADMIN_ENDPOINTS } from '../endpoints';

export const getEmployees = async () => {
  try {
    const response = await axiosInstance.get(ADMIN_ENDPOINTS.GET_EMPLOYEES);
    const { code, message, result } = response.data;

    if (code === 200) {
      return {
        success: true,
        data: result
      };
    }

    return {
      success: false,
      message: message || 'Lấy danh sách nhân viên thất bại'
    };
  } catch (error) {
    console.error('Get employees error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Lấy danh sách nhân viên thất bại'
    };
  }
};
