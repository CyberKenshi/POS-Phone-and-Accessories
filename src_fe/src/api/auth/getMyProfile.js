import axiosInstance from '../axios';
import { AUTH_ENDPOINTS } from '../endpoints';

export const getMyProfile = async () => {
  try {
    const response = await axiosInstance.get(AUTH_ENDPOINTS.GET_MY_PROFILE);
    const { code, message, result } = response.data;

    if (code === 200 || code === 201) {
      return {
        success: true,
        data: {
          ...result,
          avatar: result.avatar || null
        }
      };
    }

    return {
      success: false,
      message: message || 'Lấy thông tin cá nhân thất bại'
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Lấy thông tin cá nhân thất bại'
    };
  }
};
