import axiosInstance from '../axios';
import { ADMIN_ENDPOINTS } from '../endpoints';

export const resendLoginEmail = async (email) => {
  try {
    const response = await axiosInstance.post(ADMIN_ENDPOINTS.RESEND_LOGIN_EMAIL(email));
    const { code, message } = response.data;

    if (code === 200 || code === 201) {
      return {
        success: true,
        message: 'Gửi email thành công'
      };
    }

    return {
      success: false,
      message: message || 'Gửi email thất bại'
    };
  } catch (error) {
    console.error('Resend login email error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Gửi email thất bại'
    };
  }
};
