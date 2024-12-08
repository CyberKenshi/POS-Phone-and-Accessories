import axiosInstance from '../axios';
import { PRODUCT_ENDPOINTS } from '../endpoints';

export const useProduct = () => {
  const getProducts = async (page = 1, category = null) => {
    try {
      let url = `${PRODUCT_ENDPOINTS.GET_PRODUCTS}?page=${page}&limit=8`;
      if (category && category !== 'all') {
        url += `&category=${category}`;
      }

      const response = await axiosInstance.get(url);
      const { code, message, result } = response.data;

      if (code === 200) {
        return {
          success: true,
          data: result.products,
          pagination: result.pagination
        };
      }

      return {
        success: false,
        message: message || 'Không tìm thấy sản phẩm'
      };
    } catch (error) {
      console.error('Get products error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lấy danh sách sản phẩm thất bại'
      };
    }
  };

  const addProduct = async (productData) => {
    try {
      const formData = new FormData();

      // Thêm các trường thông tin cơ bản
      formData.append('productName', productData.productName);
      formData.append('importPrice', productData.importPrice);
      formData.append('retailPrice', productData.retailPrice);
      formData.append('manufacturer', productData.manufacturer);
      formData.append('description', productData.description);
      formData.append('stockQuantity', productData.stockQuantity);
      formData.append('categoryId', productData.categoryId);

      // Xử lý upload nhiều file
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await axiosInstance.post(PRODUCT_ENDPOINTS.GET_PRODUCTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { code, message, result } = response.data;

      if (code === 200 || code === 201) {
        return {
          success: true,
          data: result
        };
      }

      return {
        success: false,
        message: message || 'Thêm sản phẩm thất bại'
      };
    } catch (error) {
      console.error('Add product error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Thêm sản phẩm thất bại'
      };
    }
  };

  const getProductDetail = async (productId) => {
    try {
      const response = await axiosInstance.get(PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL(productId));
      const { code, message, result } = response.data;

      if (code === 200) {
        return {
          success: true,
          data: result
        };
      }

      return {
        success: false,
        message: message || 'Lấy chi tiết sản phẩm thất bại'
      };
    } catch (error) {
      console.error('Get product detail error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lấy chi tiết sản phẩm thất bại'
      };
    }
  };

  const updateProduct = async (productId, updateData) => {
    try {
      const formData = new FormData();

      // Chỉ append những field được cập nhật
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          if (key === 'images' && updateData[key].length > 0) {
            updateData[key].forEach((image) => {
              formData.append('images', image);
            });
          } else {
            formData.append(key, updateData[key]);
          }
        }
      });

      const response = await axiosInstance.patch(PRODUCT_ENDPOINTS.UPDATE_PRODUCT(productId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { code, message, result } = response.data;

      if (code === 200 || code === 201) {
        return {
          success: true,
          data: result
        };
      }

      return {
        success: false,
        message: message || 'Cập nhật sản phẩm thất bại'
      };
    } catch (error) {
      console.error('Update product error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Cập nhật sản phẩm thất bại'
      };
    }
  };

  const searchProducts = async (searchParams) => {
    try {
      let endpoint = PRODUCT_ENDPOINTS.GET_PRODUCTS;
      const { searchType, searchValue, page = 1, limit = 10 } = searchParams;

      // Xử lý endpoint theo loại tìm kiếm
      if (searchType === 'productId') {
        endpoint = PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL(searchValue);
      } else if (searchType === 'barcode') {
        endpoint = PRODUCT_ENDPOINTS.GET_PRODUCT_BY_BARCODE(searchValue);
      } else {
        // Các trường còn lại sẽ dùng query params
        endpoint = `${endpoint}?${searchType}=${searchValue}&page=${page}&limit=${limit}`;
      }

      const response = await axiosInstance.get(endpoint);
      const { code, message, result } = response.data;

      if (code === 200 || code === 201) {
        return {
          success: true,
          data: result.products || [result], // Xử lý cả trường hợp trả về array hoặc single object
          pagination: result.pagination
        };
      }

      return {
        success: false,
        message: message || 'Không tìm thấy sản phẩm'
      };
    } catch (error) {
      console.error('Search products error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Tìm kiếm sản phẩm thất bại'
      };
    }
  };

  return {
    getProducts,
    addProduct,
    getProductDetail,
    updateProduct,
    searchProducts
  };
};
