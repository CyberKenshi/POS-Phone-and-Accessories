import axiosInstance from '../axios';
import { PRODUCT_ENDPOINTS } from '../endpoints';

export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(PRODUCT_ENDPOINTS.DELETE_PRODUCT(id));
    const { code, message } = response.data;

    if (code === 200 || code === 201) {
      return {
        success: true
      };
    }

    return {
      success: false,
      message: message || 'Xóa sản phẩm thất bại'
    };
  } catch (error) {
    console.error('Delete product error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Xóa sản phẩm thất bại'
    };
  }
};
