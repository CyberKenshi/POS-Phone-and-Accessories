import axiosInstance from '../axios';
import { ADMIN_ENDPOINTS } from '../endpoints';

export const toggleLockEmployee = async (id) => {
  try {
    const response = await axiosInstance.patch(ADMIN_ENDPOINTS.TOGGLE_LOCK_EMPLOYEE(id));
    const { code, message, result } = response.data;

    if (code === 200 || code === 201) {
      return {
        success: true,
        data: result
      };
    }

    return {
      success: false,
      message: message || 'Thay đổi trạng thái khóa thất bại'
    };
  } catch (error) {
    console.error('Toggle lock employee error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Thay đổi trạng thái khóa thất bại'
    };
  }
};
