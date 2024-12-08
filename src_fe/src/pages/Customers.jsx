import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  TablePagination
} from '@mui/material';

import MainCard from 'components/MainCard';

import { useCustomer } from '../api/customer/customer';
import { alpha } from '@mui/material/styles';

const Customers = () => {
  const { customers, customersError, customersLoading, searchCustomerByPhone } = useCustomer();

  const [searchPhone, setSearchPhone] = useState('');

  const [searchResult, setSearchResult] = useState(null);

  const [searching, setSearching] = useState(false);

  const [searchError, setSearchError] = useState(null);

  const [displayedData, setDisplayedData] = useState([]);

  // Phân trang

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  // Cập nhật displayedData khi customers thay đổi

  useEffect(() => {
    setDisplayedData(customers);
  }, [customers]);

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      setDisplayedData(customers);

      setSearchResult(null);

      setSearchError(null);

      return;
    }

    setSearching(true);

    setSearchError(null);

    setSearchResult(null);

    try {
      const result = await searchCustomerByPhone(searchPhone.trim());

      if (result.success && (result.code === 200 || result.code === 201)) {
        setSearchResult(result);

        // Cập nhật displayedData với kết quả tìm kiếm

        setDisplayedData(result.result);
      } else {
        setSearchError('No customer information found');

        setDisplayedData(customers);
      }
    } catch (error) {
      setSearchError('No customers found with this phone number');

      setDisplayedData(customers);
    } finally {
      setSearching(false);
    }
  };

  // Xử lý khi người dùng thay đổi nội dung tìm kiếm

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchPhone(value);

    if (!value.trim()) {
      setDisplayedData(customers);

      setSearchResult(null);

      setSearchError(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);
  };

  const handleRowClick = (phone) => {
    navigate(`/customer/${phone}`);
  };

  if (customersLoading) {
    return (
      <MainCard title="Customers">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (customersError) {
    return (
      <MainCard title="Customers">
        <Alert severity="error">An error occurred while loading the customer list</Alert>
      </MainCard>
    );
  }

  // Tính toán dữ liệu cho trang hiện tại

  const startIndex = page * rowsPerPage;

  const endIndex = startIndex + rowsPerPage;

  const paginatedData = Array.isArray(displayedData) ? displayedData.slice(startIndex, endIndex) : [];

  return (
    <MainCard
      title="Customers"
      sx={{
        '& .MuiCardContent-root': {
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
        }
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            '& .MuiTextField-root': {
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            },
            '& .MuiButton-root': {
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }
          }}
        >
          <TextField
            label="Search by phone number"
            value={searchPhone}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />

          <Button variant="contained" onClick={handleSearch} disabled={searching}>
            {searching ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Box>

        {searchError && <Alert severity="error">{searchError}</Alert>}

        {searchResult && searchResult.success && <Alert severity="success" sx={{ mb: 2 }}></Alert>}
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: 2,
          overflow: 'hidden',
          '& .MuiTableHead-root': {
            background: (theme) => alpha(theme.palette.primary.main, 0.05),
            '& .MuiTableCell-head': {
              color: 'primary.main',
              fontWeight: 600
            }
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>

              <TableCell>Customer ID</TableCell>

              <TableCell>Customer Name</TableCell>

              <TableCell>Phone Number</TableCell>

              <TableCell>Email</TableCell>

              <TableCell>Address</TableCell>

              <TableCell>Created At</TableCell>

              <TableCell>Updated At</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((customer, index) => (
              <TableRow
                key={customer.customerId}
                onClick={() => handleRowClick(customer.phoneNumber)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell>{startIndex + index + 1}</TableCell>

                <TableCell>{customer.customerId}</TableCell>

                <TableCell>{customer.customerName}</TableCell>

                <TableCell>{customer.phoneNumber}</TableCell>

                <TableCell>{customer.email}</TableCell>

                <TableCell>{customer.address}</TableCell>

                <TableCell>{customer.createdAt}</TableCell>

                <TableCell>{customer.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={displayedData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Number of rows per page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        sx={{ mt: 2, '& .MuiTablePagination-select': { background: '#fff', borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } }}
      />
    </MainCard>
  );
};

export default Customers;
