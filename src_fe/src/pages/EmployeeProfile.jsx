import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';

import { IconLock, IconUserOff, IconLockOpen } from '@tabler/icons-react';

import MainCard from 'components/MainCard';

import { getEmployeeProfile } from '../api/admin/getEmployeeProfile';

import { toggleLockEmployee } from '../api/admin/toggleLockEmployee';

const EmployeeProfile = () => {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);

  const [orders, setOrders] = useState([]);

  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,

    message: '',

    severity: 'success'
  });

  // Fetch profile function

  const fetchProfile = async () => {
    const response = await getEmployeeProfile(id);

    if (response.success) {
      setProfile(response.data.employee);

      setOrders(response.data.orders);
    } else {
      setError(response.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // Xử lý toggle lock

  const handleToggleLock = async () => {
    try {
      const response = await toggleLockEmployee(id);

      if (response.success) {
        setSnackbar({
          open: true,

          message: `${profile.isLocked ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`,

          severity: 'success'
        });

        setOpenDialog(false);

        fetchProfile(); // Refresh profile để cập nhật trạng thái
      } else {
        setSnackbar({
          open: true,

          message: response.message,

          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,

        message: 'Có lỗi xảy ra',

        severity: 'error'
      });
    }
  };

  if (error) return <Typography color="error">{error}</Typography>;

  if (!profile) return <Typography>Loading...</Typography>;

  return (
    <MainCard title="Employee Profile">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} display="flex" justifyContent="center">
              <Avatar src={profile.avatar || '/assets/images/default-avatar.png'} alt={profile.fullName} sx={{ width: 200, height: 200 }} />
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    ID
                  </Typography>

                  <Typography variant="body1">{profile.userId}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Full Name
                  </Typography>

                  <Typography variant="body1">{profile.fullName}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>

                  <Typography variant="body1">{profile.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone Number
                  </Typography>

                  <Typography variant="body1">{profile.mobile}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Username
                  </Typography>

                  <Typography variant="body1">{profile.username}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Role
                  </Typography>

                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {profile.role}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Active Status
                    </Typography>

                    {profile.isActive ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip icon={<IconUserOff size={16} />} label="Inactive" color="error" size="small" />
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Locked Status
                    </Typography>

                    <Button
                      variant="outlined"
                      color={profile.isLocked ? 'error' : 'success'}
                      startIcon={profile.isLocked ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                      onClick={() => setOpenDialog(true)}
                      size="small"
                    >
                      {profile.isLocked ? 'Locked' : 'Unlocked'}
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog xác nhận */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to {profile.isLocked ? 'unlock' : 'lock'} the account of {profile.fullName}?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>

          <Button onClick={handleToggleLock} variant="contained" color={profile.isLocked ? 'success' : 'error'}>
            {profile.isLocked ? 'Unlock' : 'Lock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <MainCard title="Order History">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>

              <TableCell>Order Date</TableCell>

              <TableCell>Total</TableCell>

              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>

                <TableCell>{order.orderDate}</TableCell>

                <TableCell>{order.total}</TableCell>

                <TableCell>{order.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MainCard>
    </MainCard>
  );
};

export default EmployeeProfile;
