import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import MainCard from 'components/MainCard';
import axiosInstance from '../api/axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from 'components/InvoicePDF';

const Checkout = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [customerExists, setCustomerExists] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    email: ''
  });
  const [createError, setCreateError] = useState(null);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/cards');
      return;
    }
    setCartItems(savedCart);
    const total = savedCart.reduce((sum, item) => sum + item.quantity * item.retailPrice, 0);
    setTotalAmount(total);
  }, [navigate]);

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
    setError(null);
  };

  const checkCustomerHistory = async (phone) => {
    try {
      const response = await axiosInstance.get(`/api/customers/history/${encodeURIComponent(phone)}`);
      if (response.data.success) {
        setOrderHistory(response.data.result.orders);
        setCustomerInfo(response.data.result.customer);
        setCustomerExists(true);
        setNotification({ show: false, message: '', type: 'info' });
      }
    } catch (err) {
      if (err.response?.data?.code === 404) {
        if (err.response.data.message === 'Customer not found') {
          setOrderHistory([]);
          setCustomerExists(false);
          handleOpenCreateDialog();
        } else if (err.response.data.message === 'No orders found') {
          setOrderHistory([]);
          setCustomerExists(true);
          setNotification({
            show: true,
            message: 'The customer has no orders yet',
            type: 'info'
          });
        }
      } else {
        setError('An error occurred while checking customer information');
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      if (!phoneNumber.trim()) {
        setError('Please enter the customer phone number');
        return;
      }
      checkCustomerHistory(phoneNumber);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      // Tạo đơn hàng mới
      const createOrderResponse = await axiosInstance.post('/api/orders', {
        phoneNumber: phoneNumber
      });

      if (createOrderResponse.data.success) {
        const newOrderId = createOrderResponse.data.result.orderId;
        setOrderId(newOrderId);

        // Thêm từng sản phẩm vào đơn hàng
        for (const item of cartItems) {
          try {
            await axiosInstance.post(`/api/orders/add-product/${newOrderId}`, {
              productName: item.productName,
              barcode: item.barcode || '',
              quantity: item.quantity
            });
          } catch (err) {
            console.error(`Error adding product ${item.productName}:`, err);
            throw new Error(`Cannot add product ${item.productName} to the order`);
          }
        }

        // Mở dialog nhập tiền sau khi thêm sản phẩm thành công
        setCheckoutDialog(true);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setNotification({
        show: true,
        message: err.message || 'An error occurred while placing the order',
        type: 'error'
      });
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await axiosInstance.post('/api/customers', newCustomer);

      if (response.data.success) {
        // Đóng dialog
        setOpenCreateDialog(false);

        // Cập nhật trạng thái khách hàng tồn tại
        setCustomerExists(true);

        // Hiển thị thông báo thành công
        setNotification({
          show: true,
          message: 'Customer created successfully',
          type: 'success'
        });

        // Reset form tạo khách hàng
        setNewCustomer({
          customerName: '',
          phoneNumber: '',
          address: '',
          email: ''
        });

        // Reset lỗi nếu có
        setCreateError(null);

        // Không cần gọi lại checkCustomerHistory vì khách hàng mới sẽ chưa có lịch sử
        setOrderHistory([]);
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'An error occurred while creating the customer');
    }
  };

  const handleOpenCreateDialog = () => {
    setNewCustomer({
      ...newCustomer,
      phoneNumber: phoneNumber // Tự động điền số điện thoại đã nhập
    });
    setOpenCreateDialog(true);
    setCreateError(null);
  };

  const handleCheckout = async () => {
    try {
      const amount = parseFloat(amountReceived.replace(/[,.]/g, ''));

      if (isNaN(amount)) {
        setNotification({
          show: true,
          message: 'Please enter a valid amount',
          type: 'error'
        });
        return;
      }

      if (amount < totalAmount) {
        setNotification({
          show: true,
          message: 'The amount received must be greater than or equal to the total amount',
          type: 'error'
        });
        return;
      }

      const response = await axiosInstance.post(`/api/orders/checkout/${orderId}`, {
        amountReceived: amount
      });

      if (response.data.success) {
        const changeAmount = amount - totalAmount;
        const orderData = {
          orderId: orderId,
          total: totalAmount,
          amountReceived: amount,
          changeGiven: changeAmount
        };

        // Lưu thông tin đơn hàng đã hoàn thành
        setCompletedOrderData(orderData);

        // Đánh dấu đã thanh toán xong
        setCheckoutCompleted(true);

        // Xóa giỏ hàng
        localStorage.removeItem('cart');

        // Đóng dialog thanh toán
        setCheckoutDialog(false);

        // Mở popup PDF
        setShowPdfDialog(true);
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setNotification({
        show: true,
        message: err.response?.data?.message || 'An error occurred during checkout',
        type: 'error'
      });
    }
  };

  const handleClosePdfDialog = () => {
    setShowPdfDialog(false);
    navigate('/cards');
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const number = parseInt(value.replace(/[^\d]/g, ''), 10); // Loại bỏ ký tự không phải số
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const handleOrderClick = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/orders/details/${orderId}`);
      if (response.data.success) {
        setSelectedOrderDetail(response.data.result);
        setOrderDetailDialog(true);
      }
    } catch (err) {
      setNotification({
        show: true,
        message: 'Không thể lấy chi tiết đơn hàng',
        type: 'error'
      });
    }
  };

  return (
    <MainCard title="Order">
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Customer phone number"
          variant="outlined"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
      </Box>

      {notification.show && (
        <Alert severity={notification.type} sx={{ mb: 2 }}>
          {notification.message}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Current order information
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item.productId}>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.image?.[0] && (
                      <img
                        src={item.image[0]}
                        alt={item.productName}
                        style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <Typography>{item.productName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.retailPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                <TableCell align="right">
                  {(item.quantity * item.retailPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 4 }}>
        <Typography variant="h6">Tổng tiền: {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/cards')}>
            Back to cart
          </Button>
          {customerExists && (
            <Button variant="contained" color="primary" onClick={handleSubmitOrder}>
              Confirm order
            </Button>
          )}
        </Box>
      </Box>

      {customerExists && customerInfo && (
        <Box sx={{ mb: 4, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Customer information
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>
                <strong>Customer ID:</strong> {customerInfo.customerId}
              </Typography>
              <Typography>
                <strong>Customer name:</strong> {customerInfo.customerName}
              </Typography>
              <Typography>
                <strong>Phone number:</strong> {customerInfo.phoneNumber}
              </Typography>
              <Typography>
                <strong>Address:</strong> {customerInfo.address || 'Not updated'}
              </Typography>
              <Typography>
                <strong>Email:</strong> {customerInfo.email || 'Not updated'}
              </Typography>
              <Typography>
                <strong>Created at:</strong> {customerInfo.createdAt}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {orderHistory.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
            Customer order history
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Order date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderHistory.map((order) => (
                  <TableRow
                    key={order.orderId}
                    onClick={() => handleOrderClick(order.orderId)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                  >
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell align="right">{order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                    <TableCell align="right">
                      {order.amountReceived.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </TableCell>
                    <TableCell align="right">{order.changeGiven.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                    <TableCell>{order.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create new customer</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newCustomer.customerName}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone number"
              value={newCustomer.phoneNumber}
              onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCustomer} disabled={!newCustomer.customerName || !newCustomer.phoneNumber}>
            Create customer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="h6">Total: {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
            <TextField
              fullWidth
              label="Amount received from customer"
              value={amountReceived}
              onChange={(e) => {
                // const formatted = formatCurrency(e.target.value);
                // setAmountReceived(formatted);
                const value = e.target.value.replace(/[^\d]/g, ''); // Chỉ lấy ký tự số
                setAmountReceived(value); // Lưu giá trị thô
              }}
              onBlur={() => {
                const formatted = formatCurrency(amountReceived); // Định dạng khi mất focus
                setAmountReceived(formatted);
              }}
              error={parseFloat(amountReceived.replace(/[,.]/g, '')) < totalAmount}
              helperText={
                parseFloat(amountReceived.replace(/[,.]/g, '')) < totalAmount
                  ? 'The amount received must be greater than or equal to the total amount'
                  : ''
              }
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>VND</Typography>
              }}
            />
            {amountReceived && (
              <Typography color="primary">
                Change:{' '}
                {(parseFloat(amountReceived.replace(/[,.]/g, '')) - totalAmount).toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={!amountReceived || parseFloat(amountReceived.replace(/[,.]/g, '')) < totalAmount}
          >
            Confirm checkout
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showPdfDialog} onClose={handleClosePdfDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Payment successful</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              The order has been paid successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Change: {completedOrderData?.changeGiven.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
          </Box>
          {completedOrderData && (
            <PDFDownloadLink
              document={
                <InvoicePDF
                  orderData={completedOrderData}
                  cartItems={cartItems}
                  customerPhone={phoneNumber}
                  customerName={newCustomer.customerName || 'Guest'}
                  staffName="Admin"
                />
              }
              fileName={`invoice-${completedOrderData.orderId}.pdf`}
              style={{
                textDecoration: 'none'
              }}
            >
              {({ loading }) => (
                <Button variant="contained" color="primary" fullWidth disabled={loading}>
                  {loading ? 'Generating Invoice...' : 'Download Invoice'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePdfDialog}>Close and back to product page</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={orderDetailDialog} onClose={() => setOrderDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order details</DialogTitle>
        <DialogContent>
          {selectedOrderDetail && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Order ID:</strong> {selectedOrderDetail.order.orderId}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Order date:</strong> {selectedOrderDetail.order.orderDate}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Status:</strong> {selectedOrderDetail.order.status}
                </Typography>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit price</TableCell>
                      <TableCell align="right">Total price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrderDetail.products.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <Typography variant="body2">{product.productName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Barcode: {product.barcode}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{product.quantity}</TableCell>
                        <TableCell align="right">
                          {product.unitPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </TableCell>
                        <TableCell align="right">
                          {product.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="h6">
                  Total: {selectedOrderDetail.order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
                <Typography>
                  Amount received:{' '}
                  {selectedOrderDetail.order.amountReceived.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
                <Typography>
                  Change: {selectedOrderDetail.order.changeGiven.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Checkout;
