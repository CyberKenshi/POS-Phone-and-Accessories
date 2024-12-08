import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useEmployee } from 'api/admin/employee';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - REGISTER ||============================ //

export default function AuthRegister() {
  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  const { createEmployee } = useEmployee();

  return (
    <>
      <Formik
        initialValues={{
          fullName: '',
          email: ''
          // ... other fields
        }}
        validationSchema={Yup.object().shape({
          fullName: Yup.string().max(255).required('Full Name is required'),
          email: Yup.string().email('Invalid email').max(255).required('Email is required')
          // ... other validations
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            // Gọi API tạo employee
            const result = await createEmployee({
              fullName: values.fullName,
              email: values.email
            });

            if (result.success) {
              setStatus({ success: true });
              navigate('/'); // Chuyển đến trang login sau khi đăng ký thành công
            } else {
              setStatus({ success: false });
              setErrors({ submit: result.message });
            }
          } catch (err) {
            setStatus({ success: false });
            setErrors({ submit: err.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Full Name field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="fullName-signup">Full Name</InputLabel>
                  <OutlinedInput
                    id="fullName-signup"
                    type="text"
                    value={values.fullName}
                    name="fullName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Engfa"
                    fullWidth
                    error={Boolean(touched.fullName && errors.fullName)}
                  />
                  {touched.fullName && errors.fullName && <FormHelperText error>{errors.fullName}</FormHelperText>}
                </Stack>
              </Grid>

              {/* Email field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email</InputLabel>
                  <OutlinedInput
                    id="email-signup"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="engfa@example.com"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                  {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                </Stack>
              </Grid>

              {/* Error message */}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              {/* Submit button */}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Sign up
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
