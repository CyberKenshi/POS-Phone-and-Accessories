import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { IconLock, IconUserOff, IconCamera } from '@tabler/icons-react';
import MainCard from 'components/MainCard';
import { getMyProfile } from '../api/auth/getMyProfile';
import Avatar from 'components/@extended/Avatar';
import axiosInstance from '../api/axios';
import { AUTH_ENDPOINTS } from '../api/endpoints';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch profile function
  const fetchProfile = async () => {
    const response = await getMyProfile();
    if (response.success) {
      setProfile(response.data);
      setOrders(response.data.orders || []);
    } else {
      setError(response.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Xử lý khi chọn file
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Xử lý khi upload avatar
  const handleUploadAvatar = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 200 || response.data.code === 201) {
        setSnackbar({
          open: true,
          message: 'Update avatar successfully!',
          severity: 'success'
        });
        setOpenDialog(false);
        fetchProfile(); // Refresh profile để lấy avatar mới
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Update avatar failed!',
        severity: 'error'
      });
    }
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (error) return <Typography color="error">{error}</Typography>;
  if (!profile) return <Typography>Loading...</Typography>;

  return (
    <MainCard title="My Profile">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
              <Avatar src={profile.avatar || '/assets/images/default-avatar.png'} alt={profile.fullName} sx={{ width: 200, height: 200 }} />
              <Button variant="outlined" startIcon={<IconCamera size={20} />} onClick={() => setOpenDialog(true)} sx={{ mt: 2 }}>
                Change avatar
              </Button>
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
                  <Typography variant="body1">{profile.mobile || 'Not updated'}</Typography>
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
                    {profile.isLocked ? (
                      <Chip icon={<IconLock size={16} />} label="Locked" color="warning" size="small" />
                    ) : (
                      <Chip label="Unlocked" color="success" size="small" />
                    )}
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog Upload Avatar */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change avatar</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            {previewUrl ? (
              <Avatar src={previewUrl} alt="Preview" sx={{ width: 200, height: 200, mx: 'auto' }} />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No image selected
              </Typography>
            )}
            <input accept="image/*" type="file" onChange={handleFileSelect} style={{ display: 'none' }} id="avatar-upload" />
            <label htmlFor="avatar-upload">
              <Button variant="outlined" component="span" sx={{ mt: 2 }}>
                Select image
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUploadAvatar} variant="contained" disabled={!selectedFile}>
            Save
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
    </MainCard>
  );
};

export default MyProfile;
