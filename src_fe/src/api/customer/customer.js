import { useMemo } from 'react';

import useSWR from 'swr';

import axiosInstance from '../axios';

import { CUSTOMER_ENDPOINTS } from '../endpoints';

const fetcher = async (url) => {
  try {
    const response = await axiosInstance.get(url);

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error('Invalid data structure');
  } catch (error) {
    console.error('Error fetching data:', error);

    throw error;
  }
};

export function useCustomer() {
  const { data, error, isLoading, mutate } = useSWR(CUSTOMER_ENDPOINTS.GET_CUSTOMERS, fetcher);

  const searchCustomerByPhone = async (phone) => {
    try {
      const response = await axiosInstance.get(CUSTOMER_ENDPOINTS.GET_CUSTOMER_BY_PHONE(phone));

      return response.data;
    } catch (error) {
      console.error('Error searching customer:', error);

      throw error;
    }
  };

  const getCustomerOrders = async (phone) => {
    try {
      const response = await axiosInstance.get(CUSTOMER_ENDPOINTS.GET_CUSTOMER_ORDERS(phone));

      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);

      throw error;
    }
  };

  const getOrderDetails = async (orderId) => {
    try {
      const response = await axiosInstance.get(CUSTOMER_ENDPOINTS.GET_ORDER_DETAILS(orderId));
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  };

  const updateCustomer = async (customerId, data) => {
    try {
      const response = await axiosInstance.patch(CUSTOMER_ENDPOINTS.UPDATE_CUSTOMER(customerId), data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  return useMemo(
    () => ({
      customers: data?.result || [],

      customersError: error,

      customersLoading: isLoading,

      searchCustomerByPhone,

      getCustomerOrders,

      getOrderDetails,

      mutate,

      updateCustomer
    }),

    [data, error, isLoading, mutate]
  );
}
