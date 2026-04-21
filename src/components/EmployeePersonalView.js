import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  IconButton
} from '@mui/material';
import FlowerSpinner from './HollowDotsSpinner';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import googleSheets from '../services/googleSheetsService';

const EmployeePersonalView = ({ qrData }) => {
  const [employeeData, setEmployeeData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
  }, [qrData]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const [employee, docs] = await Promise.all([
        googleSheets.getEmployeeDetails(qrData.employee_id),
        googleSheets.getEmployeeDocuments(qrData.employee_id)
      ]);
      
      setEmployeeData(employee);
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError('Failed to load employee data');
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <FlowerSpinner />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const images = documents.filter(doc => doc.doc_type === 'image');
  const pdfs = documents.filter(doc => doc.doc_type === 'pdf');

  return (
    <Container maxWidth="lg">
      {/* Personal Information Card */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3} flexWrap="wrap">
            <Avatar sx={{ width: 100, height: 100, bgcolor: '#667eea', fontSize: 48, mr: 3 }}>
              {employeeData?.name?.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {employeeData?.name}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {employeeData?.position}
              </Typography>
              <Chip 
                icon={<BadgeIcon />} 
                label={`Employee ID: ${employeeData?.employee_id}`}
                variant="outlined"
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 2, color: '#667eea' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{employeeData?.email || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <PhoneIcon sx={{ mr: 2, color: '#667eea' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{employeeData?.phone || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <CalendarTodayIcon sx={{ mr: 2, color: '#667eea' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Join Date</Typography>
                  <Typography variant="body1">{employeeData?.join_date || 'N/A'}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Typography variant="h5" gutterBottom>
        My Credentials & Documents
      </Typography>

      {documents.length === 0 ? (
        <Alert severity="info">No documents available</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Images */}
          {images.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Photos ({images.length})
                  </Typography>
                  <ImageList cols={3} rowHeight={200} gap={16}>
                    {images.map((img) => (
                      <ImageListItem key={img.doc_id}>
                        <img
                          src={img.file_url}
                          alt={img.title}
                          style={{ 
                            cursor: 'pointer', 
                            height: 200, 
                            objectFit: 'cover',
                            borderRadius: 8,
                            width: '100%'
                          }}
                          onClick={() => handleViewFile(img)}
                        />
                        <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                          {img.title}
                        </Typography>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* PDF Documents */}
          {pdfs.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents ({pdfs.length})
                  </Typography>
                  <List>
                    {pdfs.map((doc) => (
                      <ListItem 
                        button 
                        onClick={() => handleViewFile(doc)} 
                        key={doc.doc_id}
                        sx={{ borderRadius: 2, '&:hover': { bgcolor: '#f5f5f5' } }}
                      >
                        <ListItemIcon>
                          <PictureAsPdfIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary={doc.title} />
                        <VisibilityIcon color="action" />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* File Preview Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFile?.title}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFile?.doc_type === 'image' ? (
            <img 
              src={selectedFile.file_url} 
              alt={selectedFile.title} 
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <iframe
              src={selectedFile?.file_url}
              title={selectedFile?.title}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button href={selectedFile?.file_url} target="_blank" variant="contained">
            Open Full Screen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeePersonalView;