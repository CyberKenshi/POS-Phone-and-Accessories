import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Stack,
  Button
} from '@mui/material';
import axiosInstance from '../../api/axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const DashboardDefault = () => {
  const [timelineType, setTimelineType] = useState('preset');
  const [selectedTimeline, setSelectedTimeline] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesReport, setSalesReport] = useState(null);
  const [productsReport, setProductsReport] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const fetchReports = async (params) => {
    try {
      let apiParams = '';
      let requestBody = {};

      if (timelineType === 'preset') {
        apiParams = `?timeline=${params.timeline}`;
      } else if (timelineType === 'custom' && params.startDate && params.endDate) {
        requestBody = {
          startDate: params.startDate,
          endDate: params.endDate
        };
      }

      const [salesRes, productsRes] = await Promise.all([
        axiosInstance.post(`/api/reports/sales${apiParams}`, requestBody),
        axiosInstance.post(`/api/reports/products${apiParams}`, requestBody)
      ]);

      if (salesRes.data.success) {
        setSalesReport(salesRes.data.result);
      }

      if (productsRes.data.success) {
        setProductsReport(productsRes.data.result);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Xử lý khi thay đổi loại timeline
  const handleTimelineTypeChange = (event) => {
    const newType = event.target.value;
    setTimelineType(newType);

    if (newType === 'preset') {
      // Nếu chuyển về preset, gọi API với timeline mặc định
      fetchReports({ timeline: selectedTimeline });
    }
  };

  // Xử lý khi thay đổi preset timeline
  const handleTimelineChange = (event) => {
    const newTimeline = event.target.value;
    setSelectedTimeline(newTimeline);
    fetchReports({ timeline: newTimeline });
  };

  // Xử lý khi nhấn nút Xem báo cáo cho custom date
  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      fetchReports({
        startDate: startDate,
        endDate: endDate
      });
    }
  };

  // Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchReports({ timeline: 'today' });
  }, []);

  useEffect(() => {
    // Thêm hàm kiểm tra role
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/api/employee/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setUserRole(response.data.result.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    checkUserRole();
  }, []);

  // Thêm styles cho cards
  const cardStyle = {
    background: 'linear-gradient(135deg, #6ac6f8 0%, #4a90e2 100%)',
    color: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
  };

  const cardContentStyle = {
    '& .MuiTypography-subtitle2': {
      color: 'rgba(255,255,255,0.7)'
    },
    '& .MuiTypography-h4': {
      color: '#fff'
    }
  };

  // Thêm hàm để format dữ liệu cho biểu đồ
  const formatChartData = (orders) => {
    if (!orders) return [];

    const groupedData = orders.reduce((acc, order) => {
      const date = order.orderDate.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          orders: 0,
          income: 0
        };
      }
      acc[date].total += order.total || 0;
      acc[date].income += order.amountReceived || 0;
      acc[date].orders += 1;
      return acc;
    }, {});

    return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  return (
    <Box sx={{ background: '#f8faff', p: 3 }}>
      <Card sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14)' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Select value={timelineType} onChange={handleTimelineTypeChange} size="small">
              <MenuItem value="preset">Period</MenuItem>
              <MenuItem value="custom">Costum</MenuItem>
            </Select>

            {timelineType === 'preset' ? (
              <Select value={selectedTimeline} onChange={handleTimelineChange} size="small">
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
              </Select>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="date"
                  label="From Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                  size="small"
                />
                <TextField
                  type="date"
                  label="To Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                  size="small"
                />
                <Button variant="contained" onClick={handleCustomDateSubmit} disabled={!startDate || !endDate}>
                  View Report
                </Button>
              </Stack>
            )}
          </Stack>

          {salesReport && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={cardStyle}>
                  <CardContent sx={cardContentStyle}>
                    <Typography variant="subtitle2">Total Amount Received</Typography>
                    <Typography variant="h4">
                      {salesReport.totalAmountReceived?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={cardStyle}>
                  <CardContent sx={cardContentStyle}>
                    <Typography variant="subtitle2">Total Revenue</Typography>
                    <Typography variant="h4">
                      {salesReport.totalIncome?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {userRole === 'admin' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={cardStyle}>
                    <CardContent sx={cardContentStyle}>
                      <Typography variant="subtitle2">Total Profit</Typography>
                      <Typography variant="h4">
                        {salesReport.totalProfit?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Orders
                    </Typography>
                    <Typography variant="h4">{salesReport.totalOrders || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {salesReport?.orders && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                Revenue Chart
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formatChartData(salesReport.orders)}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a90e2" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4a90e2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis width={90} tickFormatter={(value) => value.toLocaleString()} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Revenue" stroke="#4a90e2" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                Order Chart
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatChartData(salesReport.orders)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tickFormatter={(value) => Math.round(value)} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" name="Orders" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                Revenue and Income Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData(salesReport.orders)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis width={90} tickFormatter={(value) => value.toLocaleString()} />

                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Revenue" stroke="#4a90e2" strokeWidth={2} />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {salesReport?.orders && (
        <Card sx={{ mt: 3, borderRadius: '12px', overflow: 'hidden' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
              Order List
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f9ff' }}>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesReport.orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell align="right">
                        {order.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
                      </TableCell>
                      <TableCell align="right">
                        {order.amountReceived?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
                      </TableCell>
                      <TableCell align="right">
                        {order.changeGiven?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {productsReport?.products && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Product Report ({productsReport.timeline})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Barcode</TableCell>
                    <TableCell align="right">Total Sold</TableCell>
                    <TableCell align="right">Stock Quantity</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productsReport.products.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>{product.productId}</TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell align="right">{product.totalSold}</TableCell>
                      <TableCell align="right">{product.stockQuantity}</TableCell>
                      <TableCell align="center">
                        {product.isActive ? (
                          <Typography color="success.main">Active</Typography>
                        ) : (
                          <Typography color="error.main">Inactive</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardDefault;
