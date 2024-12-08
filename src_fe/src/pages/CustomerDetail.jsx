import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Button,
  TextField,
  DialogActions,
  Snackbar
} from '@mui/material';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { useCustomer } from '../api/customer/customer';
import { alpha } from '@mui/material/styles';

const CustomerDetail = () => {
  const { phone } = useParams();
  const { getCustomerOrders, searchCustomerByPhone, getOrderDetails, updateCustomer } = useCustomer();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State cho popup chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // States cho edit customer
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerResult = await searchCustomerByPhone(phone);
        if (customerResult.success) {
          setCustomer(customerResult.result[0]);
        }

        const ordersResult = await getCustomerOrders(phone);
        if (ordersResult.success) {
          setOrders(ordersResult.result);
        }
      } catch (err) {
        setError('An error occurred while loading customer information');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [phone]);

  const handleOrderClick = async (orderId) => {
    setSelectedOrder(orderId);
    setLoadingDetails(true);
    try {
      const result = await getOrderDetails(orderId);
      if (result.success) {
        setOrderDetails(result.result);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedOrders = orders.slice(startIndex, endIndex);

  // Cập nhật editForm khi customer thay đổi
  useEffect(() => {
    if (customer) {
      setEditForm({
        customerName: customer.customerName || '',
        phoneNumber: customer.phoneNumber || '',
        email: customer.email || '',
        address: customer.address || ''
      });
    }
  }, [customer]);

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      // Tạo object chỉa đầy đủ thông tin
      const updateData = {
        customerName: editForm.customerName,
        phoneNumber: editForm.phoneNumber,
        email: editForm.email,
        address: editForm.address
      };

      // Kiểm tra xem có thay đổi gì không
      const hasChanges = Object.keys(updateData).some((key) => updateData[key] !== customer[key]);

      if (!hasChanges) {
        setSnackbar({
          open: true,
          message: 'No changes were made',
          severity: 'info'
        });
        setEditLoading(false);
        return;
      }

      // Gửi request với đầy đủ thông tin
      const result = await updateCustomer(customer.customerId, updateData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Update information successfully',
          severity: 'success'
        });

        // Cập nhật lại thông tin customer
        const customerResult = await searchCustomerByPhone(phone);
        if (customerResult.success) {
          setCustomer(customerResult.result[0]);
        }

        handleEditClose();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while updating information',
        severity: 'error'
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <MainCard title="Customer Detail">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Customer Detail">
        <Alert severity="error">{error}</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Customer Detail"
      sx={{
        '& .MuiCardContent-root': {
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
        }
      }}
    >
      {customer && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography
                    variant="h5"
                    sx={{
                      background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Customer Information
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<EditOutlined />}
                    onClick={handleEditClick}
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    Edit
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Customer ID:</strong> {customer.customerId}
                    </Typography>
                    <Typography>
                      <strong>Customer Name:</strong> {customer.customerName}
                    </Typography>
                    <Typography>
                      <strong>Phone Number:</strong> {customer.phoneNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Email:</strong> {customer.email}
                    </Typography>
                    <Typography>
                      <strong>Address:</strong> {customer.address}
                    </Typography>
                    <Typography>
                      <strong>Created At:</strong> {customer.createdAt}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                mt: 3,
                color: 'primary.main',
                fontWeight: 600
              }}
            >
              Order History ({orders.length} orders)
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: 2,
                overflow: 'hidden',
                '& .MuiTableHead-root': {
                  background: (theme) => alpha(theme.palette.primary.main, 0.05),
                  '& .MuiTableCell-head': {
                    color: 'primary.main',
                    fontWeight: 600
                  }
                },
                '& .MuiTableBody-root .MuiTableRow-root': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    transform: 'translateY(-1px)',
                    cursor: 'pointer'
                  }
                }
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Amount Received</TableCell>
                    <TableCell align="right">Change Given</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrders.map((order, index) => (
                    <TableRow
                      key={order.orderId}
                      onClick={() => handleOrderClick(order.orderId)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell align="right">{order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                      <TableCell align="right">
                        {order.amountReceived.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </TableCell>
                      <TableCell align="right">
                        {order.changeGiven.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={orders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Number of orders per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>
      )}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Order Details</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : orderDetails ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Information
                  </Typography>
                  <Typography>Order ID: {orderDetails.order.orderId}</Typography>
                  <Typography>Order Date: {orderDetails.order.orderDate}</Typography>
                  <Typography>Total: {orderDetails.order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
                  <Typography>
                    Amount Received: {orderDetails.order.amountReceived.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                  <Typography>
                    Change Given: {orderDetails.order.changeGiven.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                  <Typography>Status: {orderDetails.order.status}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Product List
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product ID</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Barcode</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderDetails.products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell>{product.productId}</TableCell>
                            <TableCell>{product.productName}</TableCell>
                            <TableCell>{product.barcode}</TableCell>
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
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="error">Cannot load order details</Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa thông tin */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Edit Customer Information</Typography>
            <IconButton onClick={handleEditClose}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customerName"
                  value={editForm.customerName}
                  onChange={handleEditFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone Number" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditFormChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" name="email" value={editForm.email} onChange={handleEditFormChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" name="address" value={editForm.address} onChange={handleEditFormChange} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={editLoading}>
            {editLoading ? <CircularProgress size={24} /> : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default CustomerDetail;
