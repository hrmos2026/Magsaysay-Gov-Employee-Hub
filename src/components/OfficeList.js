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
  Container
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import FlowerSpinner from './FlowerSpinner';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import googleSheets from '../services/googleSheetsService';
import Layout from './Layout';

const OfficeList = () => {  
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffices();
  }, []);

  useEffect(() => {
    const filtered = offices.filter(office =>
      office.office_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.office_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOffices(filtered);
  }, [searchTerm, offices]);

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const data = await googleSheets.getOffices();
      setOffices(data);
      setFilteredOffices(data);
      setError(null);
    } catch (err) {
      setError('Failed to load offices. Please make sure your Google Sheet is public.');
      console.error('Error fetching offices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOfficeClick = (officeId, officeName) => {
    navigate(`/office/${officeId}/employees`, { state: { officeName } });
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <FlowerSpinner />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
            Government Offices Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and manage employee records across all government offices
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search offices by name, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {filteredOffices.length === 0 ? (
          <Alert severity="info">No offices found. Please check back later.</Alert>
        ) : (
          <>
            <Box mb={3}>
              <Chip 
                label={`${filteredOffices.length} office(s) found`} 
                color="primary" 
              />
            </Box>
            
            <Grid container spacing={3}>
              {filteredOffices.map((office) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={office.office_id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: { xs: 320, sm: 360, md: 380 }
                    }}
                    onClick={() => handleOfficeClick(office.office_id, office.office_name)}
                  >
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: { xs: 2, sm: 3 }
                      }}
                    >
                      {/* Logo / Icon Section - Fixed height */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        flexDirection="column" 
                        textAlign="center" 
                        sx={{ mb: 2, minHeight: { xs: 120, sm: 140 } }}
                      >
                        {office.logo_url ? (
                          <Box
                            sx={{
                              width: { xs: 70, sm: 80, md: 90 },
                              height: { xs: 70, sm: 80, md: 90 },
                              borderRadius: '50%',
                              overflow: 'hidden',
                              boxShadow: 3,
                              mb: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              bgcolor: '#fff',
                              border: '1px solid #e8ebf0'
                            }}
                          >
                            <img
                              src={office.logo_url}
                              alt={office.office_name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        ) : (
                          <BusinessIcon sx={{ fontSize: { xs: 50, sm: 60 }, color: '#667eea', mb: 2 }} />
                        )}
                        
                        <Typography variant="h6" component="div" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                          {office.office_name}
                        </Typography>
                        
                        <Chip
                          label={office.office_code}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </Box>

                      {/* Description - Fixed height with ellipsis */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        align="center" 
                        sx={{ 
                          minHeight: { xs: 60, sm: 65 },
                          maxHeight: { xs: 60, sm: 65 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 2
                        }}
                      >
                        {office.description || 'No description available'}
                      </Typography>

                      {/* Location - Fixed at bottom */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center" 
                        sx={{ 
                          mt: 'auto',
                          pt: 1,
                          borderTop: '1px solid #f0f0f0'
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, color: '#666' }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {office.location || 'Location not specified'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default OfficeList;