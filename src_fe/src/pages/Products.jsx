import React, { useEffect, useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Pagination,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

import { useProduct } from '../api/product/product';

import axiosInstance from '../api/axios';

const ProductPage = () => {
  const { getProducts, addProduct } = useProduct();

  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState({});

  const [currentPage, setCurrentPage] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productName: '',

    importPrice: '',

    retailPrice: '',

    manufacturer: '',

    description: '',

    stockQuantity: '',

    categoryId: '',

    images: []
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const productsPerPage = 8;

  const [selectedCategory, setSelectedCategory] = useState('all');

  const [categories] = useState([
    { value: 'all', label: 'All' },

    { value: 'tablet', label: 'Tablet' },

    { value: 'watch', label: 'Watch' },

    { value: 'smartphone', label: 'Smartphone' }
  ]);

  const [formCategories] = useState([
    { id: 'tablet', name: 'Tablet' },

    { id: 'watch', name: 'Watch' },

    { id: 'smartphone', name: 'Smartphone' }
  ]);

  const navigate = useNavigate();

  const location = useLocation();

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (location.state?.snackbar) {
      const { open, message, severity } = location.state.snackbar;

      setSnackbarOpen(open);

      setSnackbarMessage(message);

      setSnackbarSeverity(severity);
    }
  }, [location.state]);

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
    const fetchProducts = async () => {
      let response;

      if (selectedCategory === 'all') {
        response = await getProducts(currentPage);
      } else {
        response = await getProducts(currentPage, selectedCategory);
      }

      if (response.success) {
        const productsData = response.data?.products || response.data || [];

        setProducts(
          productsData.map((product) => ({
            _id: product.productId,

            productName: product.productName,

            barcode: product.barcode,

            category: product.categoryId,

            importPrice: product.importPrice || 0,

            retailPrice: product.retailPrice || 0,

            images: product.image || [],

            description: product.description,

            createdAt: product.createdAt || new Date()
          }))
        );

        setPagination(
          response.pagination || {
            totalItems: productsData.length,

            totalPages: Math.ceil(productsData.length / productsPerPage)
          }
        );
      } else {
        setSnackbarSeverity('error');

        setSnackbarMessage(response.message || 'Không tìm thấy sản phẩm');

        setSnackbarOpen(true);
      }
    };

    fetchProducts();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    window.updateProductsList = (products, pagination) => {
      setProducts(
        products.map((product) => ({
          _id: product.productId,

          productName: product.productName,

          barcode: product.barcode,

          category: product.categoryId,

          importPrice: product.importPrice,

          retailPrice: product.retailPrice,

          images: product.image,

          description: product.description,

          createdAt: new Date()
        }))
      );

      if (pagination) {
        setPagination(pagination);
      }
    };

    return () => {
      delete window.updateProductsList;
    };
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);

    setNewProduct({
      productName: '',

      importPrice: '',

      retailPrice: '',

      manufacturer: '',

      description: '',

      stockQuantity: '',

      categoryId: '',

      images: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    setNewProduct({ ...newProduct, images: files });
  };

  const handleSaveProduct = async () => {
    try {
      if (!newProduct.productName || !newProduct.retailPrice || !newProduct.categoryId) {
        setSnackbarSeverity('error');

        setSnackbarMessage('Vui lòng điền đầy đủ thông tin bắt buộc!');

        setSnackbarOpen(true);

        return;
      }

      const response = await addProduct(newProduct);

      if (response.success) {
        setSnackbarSeverity('success');

        setSnackbarMessage('Add product successfully!');

        setSnackbarOpen(true);

        setOpenDialog(false);

        const refreshResponse = await getProducts(currentPage);

        if (refreshResponse.success) {
          setProducts(
            refreshResponse.data.map((product) => ({
              _id: product.productId,

              productName: product.productName,

              barcode: product.barcode,

              category: product.categoryId,

              importPrice: product.importPrice,

              retailPrice: product.retailPrice,

              images: product.image,

              description: product.description,

              createdAt: new Date()
            }))
          );

          setPagination(refreshResponse.pagination);
        }
      } else {
        setSnackbarSeverity('error');

        setSnackbarMessage(response.message || 'Có lỗi xảy ra khi thêm sản phẩm!');

        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error adding product:', error);

      setSnackbarSeverity('error');

      setSnackbarMessage('Đã xảy ra lỗi không mong muốn!');

      setSnackbarOpen(true);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);

    setCurrentPage(1);
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    const cartItem = {
      productId: product._id,

      productName: product.productName,

      quantity: 1,

      retailPrice: product.retailPrice,

      image: product.images[0]
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

    setSnackbarMessage('Product added to cart!');

    setSnackbarOpen(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        {userRole === 'admin' && (
          <Button variant="contained" color="primary" onClick={handleDialogOpen}>
            Add Product
          </Button>
        )}

        <FormControl sx={{ minWidth: 200 }}>
          <Select size="small" value={selectedCategory} onChange={handleCategoryChange} displayEmpty>
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card
              sx={{
                cursor: 'pointer',

                '&:hover': {
                  boxShadow: 6
                }
              }}
              onClick={() => handleProductClick(product._id)}
            >
              <CardMedia component="img" height="140" image={product.images[0] || '/placeholder-image.jpg'} alt={product.productName} />

              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.productName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Barcode: {product.barcode}
                </Typography>

                {product.importPrice > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Import Price: {product.importPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  Retail Price: {product.retailPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Category: {product.category}
                </Typography>

                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={(e) => handleAddToCart(e, product)}>
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          Tổng số sản phẩm: {pagination.totalItems || products.length}
        </Typography>

        <Pagination
          count={pagination.totalPages || Math.ceil(products.length / productsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {userRole === 'admin' && (
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Add new products</DialogTitle>

          <DialogContent>
            <TextField
              margin="dense"
              name="productName"
              label="Product Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.productName}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="importPrice"
              label="Import Price"
              type="number"
              fullWidth
              variant="outlined"
              value={newProduct.importPrice}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="retailPrice"
              label="Retail Price"
              type="number"
              fullWidth
              variant="outlined"
              value={newProduct.retailPrice}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="manufacturer"
              label="Manufacturer"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.manufacturer}
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
              value={newProduct.description}
              onChange={handleInputChange}
            />

            <TextField
              margin="dense"
              name="stockQuantity"
              label="Stock Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={newProduct.stockQuantity}
              onChange={handleInputChange}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="category-label">Category</InputLabel>

              <Select
                labelId="category-label"
                id="category"
                name="categoryId"
                value={newProduct.categoryId}
                label="Category"
                onChange={handleInputChange}
              >
                {formCategories.map((category) => (
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

              <input accept="image/*" type="file" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />

              <label htmlFor="image-upload">
                <Button variant="outlined" component="span">
                  Choose Image
                </Button>
              </label>

              {newProduct.images.length > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected {newProduct.images.length} images
                </Typography>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>

            <Button onClick={handleSaveProduct} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }} elevation={6} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductPage;
