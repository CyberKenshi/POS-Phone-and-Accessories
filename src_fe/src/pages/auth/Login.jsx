import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'api/auth/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
      };
      
      const response = await login(credentials);
      if (response.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // JSX cho form đăng nhập
  );
} 