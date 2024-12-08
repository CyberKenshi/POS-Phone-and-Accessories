import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Alert,
  TextField,
  Autocomplete
} from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { useProduct } from '../api/product/product';

const Cards = () => {
  const { searchProducts } = useProduct();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(savedCart);
      const total = savedCart.reduce((sum, item) => sum + item.quantity * item.retailPrice, 0);
      setTotalAmount(total);
    } catch (err) {
      setError('Error loading cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRemoveItem = (productId) => {
    try {
      const updatedCart = cartItems.filter((item) => item.productId !== productId);
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      const total = updatedCart.reduce((sum, item) => sum + item.quantity * item.retailPrice, 0);
      setTotalAmount(total);
    } catch (err) {
      setError('Error loading cart');
      console.error('Error loading cart:', err);
    }
  };

  const handleSearch = async (value) => {
    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      const barcodeResponse = await searchProducts({
        searchType: 'barcode',
        searchValue: value.trim()
      });

      if (barcodeResponse.success && barcodeResponse.data.length === 1) {
        console.log('Found product by barcode:', barcodeResponse.data[0]);
        handleProductSelect(barcodeResponse.data[0]);
        return;
      }

      const nameResponse = await searchProducts({
        searchType: 'productName',
        searchValue: value.trim()
      });

      if (nameResponse.success) {
        setSearchResults(nameResponse.data);
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Error searching products');
    }
  };

  const handleProductSelect = (product) => {
    try {
      const cartItem = {
        productId: product.productId,
        productName: product.productName,
        quantity: 1,
        retailPrice: product.retailPrice,
        image: product.image
      };

      const updatedCart = [...cartItems];
      const existingItemIndex = updatedCart.findIndex((item) => item.productId === cartItem.productId);

      if (existingItemIndex !== -1) {
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        updatedCart.push(cartItem);
      }

      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      const total = updatedCart.reduce((sum, item) => sum + item.quantity * item.retailPrice, 0);
      setTotalAmount(total);

      setSearchValue('');
      setSearchResults([]);

      console.log('Product added:', cartItem);
      console.log('Updated cart:', updatedCart);
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Error adding product');
    }
  };

  const handleQuantityChange = (productId, change) => {
    try {
      const updatedCart = cartItems.map((item) => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      const total = updatedCart.reduce((sum, item) => sum + item.quantity * item.retailPrice, 0);
      setTotalAmount(total);
    } catch (err) {
      setError('Lỗi khi cập nhật số lượng');
      console.error('Lỗi khi cập nhật số lượng:', err);
    }
  };

  if (loading) {
    return (
      <MainCard title="Cart">
        <Typography>Loading...</Typography>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Cart">
        <Alert severity="error">{error}</Alert>
      </MainCard>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MainCard title="Cart">
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cart is empty
          </Typography>
          <Button variant="contained" color="primary" href="/products">
            Continue shopping
          </Button>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Cart">
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return option.productName ? `${option.productName} (${option.barcode})` : '';
          }}
          value={searchValue}
          onChange={(event, newValue) => {
            if (newValue) {
              if (typeof newValue === 'object' && newValue.productId) {
                handleProductSelect(newValue);
              }
            }
          }}
          onInputChange={(event, newValue) => {
            setSearchValue(newValue);
            if (newValue) {
              handleSearch(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Scan barcode or enter product name"
              variant="outlined"
              fullWidth
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e.target.value);
                }
              }}
            />
          )}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item.productId}>
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.image?.[0] ? (
                      <img
                        src={item.image[0]}
                        alt={item.productName}
                        style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <Typography>{item.productName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.retailPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                <TableCell align="right">
                  {(item.quantity * item.retailPrice).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <IconButton onClick={() => handleQuantityChange(item.productId, -1)} size="small" sx={{ border: '1px solid #ddd' }}>
                      <Typography>-</Typography>
                    </IconButton>

                    <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>{item.quantity}</Typography>

                    <IconButton onClick={() => handleQuantityChange(item.productId, 1)} size="small" sx={{ border: '1px solid #ddd' }}>
                      <Typography>+</Typography>
                    </IconButton>

                    <IconButton onClick={() => handleRemoveItem(item.productId)} color="error">
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Total: {totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/checkout')}>
          Checkout
        </Button>
      </Box>
    </MainCard>
  );
};

export default Cards;
