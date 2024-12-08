import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ErrorFallback = ({ error }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Đã xảy ra lỗi!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {error.message}
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Quay về trang chủ
      </Button>
    </Box>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
