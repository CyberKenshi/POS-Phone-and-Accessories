import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Typography,
  Chip
} from '@mui/material';
import MainCard from 'components/MainCard';
import { IconLock, IconUserOff } from '@tabler/icons-react';
import { getEmployees } from '../api/admin/getEmployees';
import { useNavigate } from 'react-router-dom';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await getEmployees();
      if (response.success) {
        console.log('Employees data:', response.data);
        setEmployees(response.data);
      } else {
        console.error(response.message);
      }
    };

    fetchEmployees();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (employeeId) => {
    if (employeeId) {
      navigate(`/employee/${employeeId}`);
    }
  };

  return (
    <MainCard title="Employee List">
      <Box>
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Active Status</TableCell>
                  <TableCell>Locked Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((employee) => (
                  <TableRow
                    key={employee.userId || employee._id}
                    hover
                    onClick={() => handleRowClick(employee.userId || employee._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Avatar src={employee.avatar || '/assets/images/default-avatar.png'} alt={employee.fullName} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1">{employee.fullName}</Typography>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      {employee.isActive ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip icon={<IconUserOff size={16} />} label="Inactive" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.isLocked ? (
                        <Chip icon={<IconLock size={16} />} label="Locked" color="warning" size="small" />
                      ) : (
                        <Chip label="Unlocked" color="success" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={employees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Number of rows per page:"
          />
        </Card>
      </Box>
    </MainCard>
  );
};

export default Employees;
