import axiosInstance from '../axios';
import { ADMIN_ENDPOINTS } from '../endpoints';

export const getEmployeeProfile = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        message: 'ID nhân viên không hợp lệ'
      };
    }

    const response = await axiosInstance.get(ADMIN_ENDPOINTS.GET_EMPLOYEE_PROFILE(id));
    const { code, message, result } = response.data;

    if (code === 200 || code === 201) {
      return {
        success: true,
        data: result
      };
    }

    return {
      success: false,
      message: message || 'Lấy thông tin nhân viên thất bại'
    };
  } catch (error) {
    console.error('Get employee profile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Lấy thông tin nhân viên thất bại'
    };
  }
};
