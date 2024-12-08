import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Button, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, Typography, Box } from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import axiosInstance from 'api/axios';
import { AUTH_ENDPOINTS } from 'api/endpoints';
import MainCard from 'components/MainCard';
import { useSnackbar } from 'notistack';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [level, setLevel] = useState();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
    <MainCard title="Đổi mật khẩu">
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            submit: null
          }}
          validationSchema={Yup.object().shape({
            oldPassword: Yup.string().required('Vui lòng nhập mật khẩu cũ'),
            newPassword: Yup.string()
              .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
              .matches(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
              .matches(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
              .matches(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
              .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt')
              .required('Vui lòng nhập mật khẩu mới')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              const response = await axiosInstance.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              });

              if (response.status === 200 || response.status === 201) {
                enqueueSnackbar('Đổi mật khẩu thành công', { variant: 'success' });
                navigate('/dashboard');
              }
            } catch (err) {
              setStatus({ success: false });
              setErrors({ submit: err.response?.data?.message || 'Đã có lỗi xảy ra' });
              enqueueSnackbar(err.response?.data?.message || 'Đổi mật khẩu thất bại', { variant: 'error' });
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
                    <InputLabel htmlFor="old-password">Mật khẩu cũ</InputLabel>
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
                    <InputLabel htmlFor="new-password">Mật khẩu mới</InputLabel>
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
                        Độ mạnh mật khẩu: <span style={{ color: level.color }}>{level.label}</span>
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
                      Đổi mật khẩu
                    </Button>
                  </AnimateButton>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </Box>
    </MainCard>
  );
};

export default ChangePassword;
