import React, { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Skeleton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';

import { useProduct } from '../api/product/product';

import { deleteProduct } from '../api/product/deleteProduct';

import axiosInstance from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { getProductDetail, updateProduct } = useProduct();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [editedProduct, setEditedProduct] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [categories] = useState([
    { id: 'smartphone-1', name: 'Smartphone' },

    { id: 'watch-2', name: 'Watch' },

    { id: 'tablet-3', name: 'Tablet' }
  ]);

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/api/employee/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setUserRole(response.data.result.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchProductDetail = async () => {
      const response = await getProductDetail(id);

      if (response.success) {
        setProduct(response.data);
      } else {
        console.error(response.message);
      }

      setLoading(false);
    };

    fetchProductDetail();
  }, [id]);

  const handleEditClick = () => {
    setEditedProduct({
      productName: product.productName,

      importPrice: product.importPrice,

      retailPrice: product.retailPrice,

      manufacturer: product.manufacturer,

      description: product.description,

      categoryId: product.categoryId,

      images: []
    });

    setOpenEditDialog(true);
  };

  const handleDialogClose = () => {
    setOpenEditDialog(false);

    setEditedProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditedProduct((prev) => ({
      ...prev,

      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    setEditedProduct((prev) => ({
      ...prev,

      images: files
    }));
  };

  const handleSaveEdit = async () => {
    const changedFields = {};

    Object.keys(editedProduct).forEach((key) => {
      if (editedProduct[key] !== product[key] && (editedProduct[key] !== '' || key === 'images')) {
        changedFields[key] = editedProduct[key];
      }
    });

    const response = await updateProduct(id, changedFields);

    if (response.success) {
      setSnackbarSeverity('success');

      setSnackbarMessage('Update product successfully!');

      setSnackbarOpen(true);

      handleDialogClose();

      const refreshResponse = await getProductDetail(id);

      if (refreshResponse.success) {
        setProduct(refreshResponse.data);
      }
    } else {
      setSnackbarSeverity('error');

      setSnackbarMessage(response.message);

      setSnackbarOpen(true);
    }
  };

  const handleDeleteProduct = async () => {
    const response = await deleteProduct(id);

    if (response.success) {
      setOpenDeleteDialog(false);

      navigate('/products', { state: { snackbar: { open: true, message: 'Delete product successfully!', severity: 'success' } } });
    } else {
      setSnackbarSeverity('error');

      setSnackbarMessage(response.message);

      setSnackbarOpen(true);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);

    return category ? category.name : 'Không xác định';
  };

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.productId,

      productName: product.productName,

      quantity: 1,

      retailPrice: product.retailPrice,

      image: product.image
    };

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItemIndex = currentCart.findIndex((item) => item.productId === cartItem.productId);

    if (existingItemIndex !== -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));

    setSnackbarSeverity('success');

    setSnackbarMessage('Add product to cart successfully!');

    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={400} />

        <Skeleton variant="text" sx={{ mt: 2 }} />

        <Skeleton variant="text" />

        <Skeleton variant="text" width="60%" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Không tìm thấy sản phẩm
        </Typography>

        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs separator="/" sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/products"
          onClick={(e) => {
            e.preventDefault();

            navigate('/products');
          }}
        >
          Product List
        </Link>

        <Typography color="text.primary">Product Detail</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.image?.[0] || 'placeholder-image-url'}
              alt={product.productName}
              sx={{ objectFit: 'contain' }}
            />

            <Box sx={{ display: 'flex', gap: 1, p: 2, overflowX: 'auto' }}>
              {product.image?.map((img, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  sx={{ width: 80, height: 80, objectFit: 'cover', cursor: 'pointer' }}
                  image={img}
                  alt={`${product.productName}-${index}`}
                />
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {product.productName}
              </Typography>

              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Product ID: {product.productId}
              </Typography>

              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Barcode: {product.barcode}
              </Typography>

              <Typography variant="h5" color="primary" gutterBottom>
                Retail Price: {product.retailPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </Typography>

              <Typography variant="body1" gutterBottom>
                Manufacturer: {product.manufacturer}
              </Typography>

              <Typography variant="body1" gutterBottom>
                Category: {getCategoryName(product.categoryId)}
              </Typography>

              <Typography variant="body1" gutterBottom>
                Stock Quantity: {product.stockQuantity}
              </Typography>

              <Typography variant="body1" gutterBottom>
                Created At: {product.createdAt}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Product Description
              </Typography>

              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary" fullWidth onClick={handleAddToCart}>
                  Add to Cart
                </Button>

                {userRole === 'admin' && (
                  <>
                    <Button variant="outlined" color="primary" fullWidth onClick={handleEditClick}>
                      Edit
                    </Button>

                    <Button variant="outlined" color="error" fullWidth onClick={() => setOpenDeleteDialog(true)}>
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {userRole === 'admin' && (
        <Dialog open={openEditDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Product</DialogTitle>

          <DialogContent>
            <TextField
              margin="dense"
              name="productName"
              label="Product Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editedProduct?.productName || ''}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="importPrice"
              label="Import Price"
              type="number"
              fullWidth
              variant="outlined"
              value={editedProduct?.importPrice || ''}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="retailPrice"
              label="Retail Price"
              type="number"
              fullWidth
              variant="outlined"
              value={editedProduct?.retailPrice || ''}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="manufacturer"
              label="Manufacturer"
              type="text"
              fullWidth
              variant="outlined"
              value={editedProduct?.manufacturer || ''}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={editedProduct?.description || ''}
              onChange={handleInputChange}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="category-label">Category</InputLabel>

              <Select
                labelId="category-label"
                id="category"
                name="categoryId"
                value={editedProduct?.categoryId || ''}
                label="Category"
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Product Images
              </Typography>

              <input
                accept="image/*"
                type="file"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="edit-image-upload"
              />

              <label htmlFor="edit-image-upload">
                <Button variant="outlined" component="span">
                  Choose Image
                </Button>
              </label>

              {editedProduct?.images?.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected {editedProduct.images.length} images
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>

            <Button onClick={handleSaveEdit} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {userRole === 'admin' && (
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>

          <DialogContent>
            <Typography>Are you sure you want to delete this product?</Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>

            <Button onClick={handleDeleteProduct} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetail;
