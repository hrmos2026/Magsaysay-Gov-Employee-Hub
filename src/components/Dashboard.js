import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Container,
  Avatar,
  Tooltip,
  Button
} from '@mui/material';
import FlowerSpinner from './HollowDotsSpinner';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import googleSheets from '../services/googleSheetsService';

// Function to get office logo or fallback to folder icon
const getOfficeLogo = (office) => {
  if (office.logo_url && office.logo_url.trim() !== '') {
    return {
      type: 'image',
      url: office.logo_url
    };
  }
  return {
    type: 'folder',
    icon: <FolderIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: '#ffa000' }} />
  };
};

const Dashboard = () => {
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeCounts, setEmployeeCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffices();
  }, []);

  useEffect(() => {
    const filtered = offices.filter(office =>
      office.office_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.office_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffices(filtered);
  }, [searchTerm, offices]);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const officesData = await googleSheets.getOffices();
      setOffices(officesData);
      setFilteredOffices(officesData);
      
      const counts = {};
      for (const office of officesData) {
        const employees = await googleSheets.getEmployeesByOffice(office.office_id);
        counts[office.office_id] = employees.length;
      }
      setEmployeeCounts(counts);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching offices:', err);
      setError('Failed to load offices. Please make sure your Google Sheet is public.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficeClick = (officeId, officeName) => {
    navigate(`/office/${officeId}/employees`, { state: { officeName } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <FlowerSpinner />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box mb={{ xs: 2, sm: 3, md: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          fontWeight="bold" 
          color="#000f57" 
          sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' } }}
        >
          Government Offices Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
          Browse and manage employee records across all government offices
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search offices by name, code, description, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {filteredOffices.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'No offices match your search.' : 'No offices found.'}
        </Alert>
      ) : (
        <Grid 
          container 
          spacing={{ xs: 2, sm: 2, md: 3 }} 
          justifyContent="flex-start"
          alignItems="stretch"
        >
          {filteredOffices.map((office) => {
            const logo = getOfficeLogo(office);
            const employeeCount = employeeCounts[office.office_id] || 0;
            
            return (
              <Grid 
                item 
                xs={6} 
                sm={6} 
                md={4} 
                lg={3} 
                xl={2.4} 
                key={office.office_id} 
                sx={{ 
                  display: 'flex',
                  width: '100%'
                }}
              >
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: { xs: 'translateY(-2px)', sm: 'translateY(-4px)' },
                      boxShadow: { xs: 4, sm: 6 }
                    },
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    borderRadius: { xs: 2, sm: 2, md: 2 }
                  }}
                  onClick={() => handleOfficeClick(office.office_id, office.office_name)}
                >
                  {/* Employee Count Badge */}
                  <Chip
                    icon={<PeopleIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                    label={`${employeeCount} ${employeeCount === 1 ? 'employee' : 'employees'}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: { xs: -8, sm: -12 },
                      right: { xs: 8, sm: 16 },
                      zIndex: 1,
                      boxShadow: 1,
                      backgroundColor: employeeCount > 0 ? '#000f57' : '#9e9e9e',
                      color: 'white',
                      height: { xs: 22, sm: 24 },
                      '& .MuiChip-icon': {
                        color: 'white',
                        fontSize: { xs: 12, sm: 14 }
                      },
                      '& .MuiChip-label': {
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        px: { xs: 1, sm: 1.5 }
                      }
                    }}
                  />
                  
                  <CardContent 
                    sx={{ 
                      flexGrow: 1, 
                      textAlign: 'center', 
                      p: { xs: 1.5, sm: 2 },
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      height: '100%'
                    }}
                  >
                    {/* Office Logo */}
                    <Box mb={{ xs: 0.5, sm: 1 }} display="flex" justifyContent="center" sx={{ minWidth: 0 }}>
                      {logo.type === 'image' ? (
                        <Box
                          component="img"
                          src={logo.url}
                          alt={office.office_name}
                          sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            borderRadius: '50%',
                            objectFit: 'cover',
                            boxShadow: 2,
                            border: '2px solid #f0f0f0'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            borderRadius: '50%',
                            bgcolor: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 2,
                            border: '2px solid #f0f0f0'
                          }}
                        >
                          {logo.icon}
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ minWidth: 0, width: '100%' }}>
                      {/* Office Code */}
                      <Typography 
                        variant="h6" 
                        component="div" 
                        gutterBottom 
                        fontWeight="bold" 
                        sx={{ 
                          mb: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.9rem', sm: '1.25rem' }
                        }}
                      >
                        {office.office_code}
                      </Typography>
                      
                      {/* Office Name - NO TRUNCATION, with improved font size */}
                      <Tooltip title={office.office_name} arrow placement="top">
                        <Typography
                          variant='overline'
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                            fontWeight: 500,
                            width: '100%',
                            display: 'block',
                            textAlign: 'center',
                            lineHeight: 1.3,
                            mb: 1,
                            wordBreak: 'break-word'
                          }}
                        >
                          {office.office_name}
                        </Typography>
                      </Tooltip>
                    </Box>
                    
                    {/* View employees button - Improved design */}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        mt: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                        textTransform: 'none',
                        borderRadius: 2,
                        borderColor: '#000f57',
                        color: '#000f57',
                        '&:hover': {
                          backgroundColor: '#000f57',
                          color: 'white',
                          borderColor: '#000f57'
                        }
                      }}
                    >
                      View employees →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;