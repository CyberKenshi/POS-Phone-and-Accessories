import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import {
  Button,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Box,
  Alert,
  Snackbar
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from '../../components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from '../../utils/password-strength';
import axiosInstance from '../../api/axios';
import { AUTH_ENDPOINTS } from '../../api/endpoints';
import MainCard from '../../components/MainCard';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClickShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  return (
    <MainCard title="Change Password">
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            oldPassword: Yup.string().required('Please enter the old password'),
            newPassword: Yup.string()
              .min(8, 'Password must be at least 8 characters')
              .matches(/[0-9]/, 'Password must contain at least 1 number')
              .matches(/[a-z]/, 'Password must contain at least 1 lowercase letter')
              .matches(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
              .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least 1 special character')
              .required('Please enter the new password')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              const response = await axiosInstance.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              });

              if (response.status === 200 || response.status === 201) {
                setSnackbar({
                  open: true,
                  message: 'Change password successfully',
                  severity: 'success'
                });
                setTimeout(() => {
                  navigate('/dashboard');
                }, 1500);
              }
            } catch (err) {
              setStatus({ success: false });
              setErrors({ submit: err.response?.data?.message || 'An error occurred' });
              setSnackbar({
                open: true,
                message: err.response?.data?.message || 'Change password failed',
                severity: 'error'
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form noValidate onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="old-password">Old Password</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.oldPassword && errors.oldPassword)}
                      id="old-password"
                      type={showOldPassword ? 'text' : 'password'}
                      value={values.oldPassword}
                      name="oldPassword"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowOldPassword} edge="end" size="large">
                            {showOldPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {touched.oldPassword && errors.oldPassword && (
                      <FormHelperText error id="old-password-error">
                        {errors.oldPassword}
                      </FormHelperText>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="new-password">New Password</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.newPassword && errors.newPassword)}
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={values.newPassword}
                      name="newPassword"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        changePassword(e.target.value);
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={handleClickShowNewPassword} edge="end" size="large">
                            {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {touched.newPassword && errors.newPassword && (
                      <FormHelperText error id="new-password-error">
                        {errors.newPassword}
                      </FormHelperText>
                    )}
                  </Stack>
                  {values.newPassword && level && (
                    <FormHelperText>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        Password strength: <span style={{ color: level.color }}>{level.label}</span>
                      </Typography>
                    </FormHelperText>
                  )}
                </Grid>

                {errors.submit && (
                  <Grid item xs={12}>
                    <FormHelperText error>{errors.submit}</FormHelperText>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <AnimateButton>
                    <Button
                      disableElevation
                      disabled={isSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Change Password
                    </Button>
                  </AnimateButton>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default ChangePassword;
