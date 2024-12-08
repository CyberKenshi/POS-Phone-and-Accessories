export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  GET_MY_PROFILE: '/api/employee/profile',
  UPLOAD_AVATAR: '/api/employee/upload-avatar',
  CHANGE_PASSWORD: '/api/employee/change-password'
};

export const ADMIN_ENDPOINTS = {
  CREATE_EMPLOYEE: '/api/admin/create-employee',
  GET_EMPLOYEES: '/api/admin/employees',
  GET_EMPLOYEE_PROFILE: (id) => `/api/admin/profile/${id}`,
  TOGGLE_LOCK_EMPLOYEE: (id) => `/api/admin/employees/${id}/lock`,
  RESEND_LOGIN_EMAIL: (email) => `/api/admin/employees/${encodeURIComponent(email)}/resend-login-email`
};

export const PRODUCT_ENDPOINTS = {
  GET_PRODUCTS: '/api/products',
  GET_PRODUCT_DETAIL: (id) => `/api/products/${id}`,
  UPDATE_PRODUCT: (id) => `/api/products/${id}`,
  DELETE_PRODUCT: (id) => `/api/products/${id}`,
  GET_PRODUCT_BY_BARCODE: (barcode) => `/api/products/barcode/${barcode}`
};

export const CUSTOMER_ENDPOINTS = {
  GET_CUSTOMERS: '/api/customers',
  GET_CUSTOMER_BY_PHONE: (phone) => `/api/customers/${phone}`,
  GET_CUSTOMER_ORDERS: (phone) => `/api/orders?phoneNumber=${phone}`,
  GET_ORDER_DETAILS: (orderId) => `/api/orders/details/${orderId}`,
  UPDATE_CUSTOMER: (customerId) => `/api/customers/${customerId}`
};
