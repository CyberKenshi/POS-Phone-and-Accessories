import { useState } from 'react';

import { Link } from 'react-router-dom';

// material-ui

import { Box, Button, Grid, Stack, TextField, Typography, Snackbar, Alert } from '@mui/material';

// project import

import AuthWrapper from './authentication/AuthWrapper';

import { resendLoginEmail } from '../api/admin/resendLoginEmail';

const ResendPassword = () => {
  const [email, setEmail] = useState('');

  const [snackbar, setSnackbar] = useState({
    open: false,

    message: '',

    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setSnackbar({
        open: true,

        message: 'Vui lòng nhập email',

        severity: 'error'
      });

      return;
    }

    const result = await resendLoginEmail(email);

    setSnackbar({
      open: true,

      message: result.message,

      severity: result.success ? 'success' : 'error'
    });

    if (result.success) {
      setEmail('');
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Resend Email</Typography>
            <Typography component={Link} to="/dashboard" variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              Back Home
            </Typography>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Enter the employee's email to resend login information
                </Typography>

                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="example@company.com"
                />
              </Grid>

              <Grid item xs={12}>
                <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary">
                  Send
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

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
    </AuthWrapper>
  );
};

export default ResendPassword;
