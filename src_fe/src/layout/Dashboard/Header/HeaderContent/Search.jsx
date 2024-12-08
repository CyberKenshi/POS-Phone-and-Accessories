// material-ui
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// project imports
import { useProduct } from '../../../../api/product/product';

// ==============================|| HEADER CONTENT - SEARCH ||============================== //

export default function Search() {
  const navigate = useNavigate();
  const { searchProducts } = useProduct();
  const [searchType, setSearchType] = useState('productName');
  const [searchValue, setSearchValue] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const searchFields = [
    { value: 'productName', label: 'Product Name' },
    { value: 'productId', label: 'Product ID' },
    { value: 'barcode', label: 'Barcode' }
  ];

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      const response = await searchProducts({
        searchType,
        searchValue: searchValue.trim()
      });

      if (response.success) {
        // Nếu tìm thấy sản phẩm, cập nhật state trong Products component
        if (window.updateProductsList) {
          window.updateProductsList(response.data, response.pagination);
        }

        // Nếu tìm theo ID hoặc barcode và chỉ có 1 kết quả, chuyển đến trang chi tiết
        if (['productId', 'barcode'].includes(searchType) && response.data.length === 1) {
          navigate(`/products/${response.data[0].productId}`);
          return;
        }
      } else {
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'error'
        });
      }
    }
  };

  return (
    <Box sx={{ width: '100%', ml: { xs: 0, md: 1 }, display: 'flex', gap: 1 }}>
      <FormControl sx={{ minWidth: 120 }}>
        <Select size="small" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          {searchFields.map((field) => (
            <MenuItem key={field.value} value={field.value}>
              {field.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
        <OutlinedInput
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleSearch}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.5 }}>
              <SearchOutlined />
            </InputAdornment>
          }
          placeholder="Search..."
        />
      </FormControl>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
