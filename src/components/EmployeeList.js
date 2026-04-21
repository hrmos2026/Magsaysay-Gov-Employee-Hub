import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Box,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Card,
  CardContent,
  Grid,
  Breadcrumbs,
  Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FlowerSpinner from './HollowDotsSpinner';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import googleSheets from '../services/googleSheetsService';

const EmployeeList = () => {
  const { officeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [employees, setEmployees] = useState([]);
  const [office, setOffice] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const officeName = location.state?.officeName || 'Office';

  useEffect(() => {
    fetchEmployees();
  }, [officeId, fetchEmployees]);

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesData, officeData] = await Promise.all([
        googleSheets.getEmployeesByOffice(officeId),
        googleSheets.getOfficeDetails(officeId)
      ]);
      setEmployees(employeesData);
      setOffice(officeData);
      setFilteredEmployees(employeesData);
      setError(null);
    } catch (err) {
      setError('Failed to load employees. Please make sure your Google Sheet is public.');
    } finally {
      setLoading(false);
    }
  }, [officeId]);

  const handleViewEmployee = (employeeId) => {
    navigate(`/employee/${employeeId}`, { 
      state: { 
        officeId: officeId,
        officeName: officeName,
        officeCode: office?.office_code || ''
      } 
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <FlowerSpinner />
      </Box>
    );
  }

  return (
    <Box>
      <Paper variant="outlined" sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'white', borderColor: 'rgba(15,31,71,0.12)' }}>
        <Breadcrumbs separator="" sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, '.MuiBreadcrumbs-ol': { alignItems: 'center' } }}>
          <Button
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            startIcon={<HomeIcon />}
            sx={{
              minHeight: '30px',
              px: 1.5,
              py: 0.4,
              border: '1px solid #000f57',
              color: '#000f57',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#000f57',
                color: 'white',
                borderColor: '#000f57'
              }
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<BusinessIcon />}
            sx={{
              minHeight: '30px',
              px: 1.5,
              py: 0.4,
              ml: -1,
              backgroundColor: '#000f57',
              color: 'white',
              border: '1px solid #000f57',
              '&:hover': {
                backgroundColor: '#000f57',
                color: 'white',
                borderColor: '#000f57'
              }
            }}
          >
            {office?.office_code || officeName}
          </Button>
        </Breadcrumbs>

        {office && (
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Office overview
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 1, color: '#0f1f47' }}>
                {office.office_name}
              </Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label={office.location || 'Location not set'}
                size="small"
                icon={<LocationOnIcon />}
                variant="outlined"
              />
              <Chip
                label={`${employees.length} ${employees.length === 1 ? 'employee' : 'employees'}`}
                size="small"
                sx={{ 
                    backgroundColor: '#000f57',
                    color: 'white',
                  }}
              />
            </Box>
          </Box>
        )}
      </Paper>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {filteredEmployees.length === 0 ? (
        <Alert severity="info">No employees found in this office.</Alert>
      ) : isMobile ? (
        // Mobile View - Entire Card Clickable
        <Grid container spacing={2}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} key={employee.employee_id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderColor: 'rgba(15,31,71,0.12)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleViewEmployee(employee.employee_id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Box>
                      <Chip label={employee.employee_id} size="small" variant="outlined" sx={{ mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={700}>
                        {employee.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {employee.position}
                      </Typography>
                    </Box>
                    <IconButton
                      color="default"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents card click from firing twice
                        handleViewEmployee(employee.employee_id);
                      }}
                      size="small"
                      sx={{ 
                        bgcolor: '#f5f5f5',
                        '&:hover': { bgcolor: '#e0e0e0' }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
                    <Typography variant="body2"><strong>Email:</strong> {employee.email || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {employee.phone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Join Date:</strong> {employee.join_date || 'N/A'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop View - Entire Row Clickable
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee.employee_id} 
                  hover 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                  onClick={() => handleViewEmployee(employee.employee_id)}
                >
                  <TableCell>
                    <Chip label={employee.employee_id} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: '#000f57', width: 32, height: 32 }}>
                        {employee.name?.charAt(0)}
                      </Avatar>
                      {employee.name}
                    </Box>
                  </TableCell>
                  <TableCell>{employee.position || 'N/A'}</TableCell>
                  <TableCell>{employee.email || 'N/A'}</TableCell>
                  <TableCell>{employee.phone || 'N/A'}</TableCell>
                  
                  <TableCell align="center">
                    <IconButton
                      color="default"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents row click from firing twice
                        handleViewEmployee(employee.employee_id);
                      }}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EmployeeList;