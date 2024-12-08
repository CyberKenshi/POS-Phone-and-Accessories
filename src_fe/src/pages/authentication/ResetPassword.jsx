import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import useScriptRef from '../../hooks/useScriptRef';
import axiosInstance from '../../api/axios';

// assets
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const ResetPassword = () => {
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();
  const { loginToken } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axiosInstance.get(`/api/auth/login/${loginToken}`);
        const { code, result, message } = response.data;

        if (code === 200 && result?.token) {
          if (message?.includes('has been reset')) {
            setIsPasswordReset(true);
            navigate('/login');
            return;
          }
          localStorage.setItem('token', result.token);
          setIsValidToken(true);
        } else {
          console.error('Token không hợp lệ');
          navigate('/login');
        }
      } catch (error) {
        console.error('Lỗi khi xác thực token:', error);
        if (error.response?.data?.message?.includes('has been reset')) {
          setIsPasswordReset(true);
          navigate('/login');
          return;
        }
        navigate('/login');
      }
    };

    validateToken();
  }, [loginToken, navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default'
      }}
    >
      {isPasswordReset ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Mật khẩu đã được đặt lại trước đó. Vui lòng đăng nhập hoặc sử dụng chức năng đổi mật khẩu.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Đăng nhập
          </Button>
        </Box>
      ) : (
        isValidToken && (
          <Box
            sx={{
              maxWidth: 400,
              width: '100%',
              backgroundColor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <Formik
              initialValues={{
                password: '',
                submit: null
              }}
              validationSchema={Yup.object().shape({
                password: Yup.string()
                  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                  .matches(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
                  .matches(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
                  .matches(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
                  .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt')
                  .required('Vui lòng nhập mật khẩu')
              })}
              onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                  if (scriptedRef.current) {
                    const response = await axiosInstance.post('/api/employee/reset-password', {
                      password: values.password
                    });

                    const { code, message } = response.data;

                    if (code === 200 || code === 201) {
                      setStatus({ success: true });
                      localStorage.removeItem('token');
                      navigate('/login');
                    } else {
                      throw new Error(message || 'Đặt lại mật khẩu thất bại');
                    }
                  }
                } catch (err) {
                  console.error(err);
                  if (scriptedRef.current) {
                    setStatus({ success: false });
                    setErrors({ submit: err.message || 'Đặt lại mật khẩu thất bại' });
                    setSubmitting(false);
                  }
                }
              }}
            >
              {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <Box sx={{ p: 5 }}>
                    <Typography variant="h3" sx={{ mb: 3 }}>
                      Đặt lại mật khẩu
                    </Typography>

                    <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mb: 3 }}>
                      <InputLabel htmlFor="outlined-adornment-password">Mật khẩu</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name="password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Mật khẩu"
                      />
                      {touched.password && errors.password && (
                        <FormHelperText error id="standard-weight-helper-text-password">
                          {errors.password}
                        </FormHelperText>
                      )}
                    </FormControl>

                    {errors.submit && (
                      <Box sx={{ mt: 3 }}>
                        <FormHelperText error>{errors.submit}</FormHelperText>
                      </Box>
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        disableElevation
                        disabled={isSubmitting}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Xác nhận
                      </Button>
                    </Stack>
                  </Box>
                </form>
              )}
            </Formik>
          </Box>
        )
      )}
    </Box>
  );
};

export default ResetPassword;
