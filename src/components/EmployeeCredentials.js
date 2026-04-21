import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  Chip,
  Button,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import FolderIcon from '@mui/icons-material/Folder';
import FlowerSpinner from './HollowDotsSpinner';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import googleSheets from '../services/googleSheetsService';

// Constants
const COLORS = {
  primary: '#0f1f47',
  secondary: '#1d4ed8',
  success: '#4caf50',
  error: '#f44336',
  warning: '#f59e0b',
  info: '#2563eb',
  light: '#f8fbff',
};

const INFO_FIELDS = [
  { key: 'email', label: 'Email Address', icon: EmailIcon },
  { key: 'phone', label: 'Phone Number', icon: PhoneIcon },
  { key: 'join_date', label: 'Date Start', icon: CalendarTodayIcon },
  { key: 'birth_date', label: 'Birth Date', icon: PersonIcon },
  { key: 'address', label: 'Address', icon: LocationOnIcon, fullWidth: true },
];

// Sub-component: Information Field - Responsive
const InfoField = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', p: { xs: 1.5, sm: 2 }, bgcolor: COLORS.light, borderRadius: 2 }}>
    <Icon sx={{ mr: { xs: 1.5, sm: 2 }, color: COLORS.primary, fontSize: { xs: 24, sm: 28 } }} />
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="500" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
        {value || 'Not provided'}
      </Typography>
    </Box>
  </Box>
);

// Sub-component: Document Card
const DocumentCard = ({ doc, onOpen, getIcon }) => (
  <Card
    onClick={() => onOpen(doc.file_url)}
    sx={{
      cursor: 'pointer',
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-4px)',
        borderColor: COLORS.primary,
      },
      transition: 'all 0.2s',
      height: '100%',
      border: `1px solid #e0e0e0`,
    }}
  >
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <Box sx={{ mb: 2 }}>{getIcon(doc)}</Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {doc.title || 'Untitled Document'}
      </Typography>
      <Chip
        label={doc.doc_type?.toUpperCase() || 'DOCUMENT'}
        size="small"
        color="primary"
        variant="outlined"
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
        <OpenInNewIcon sx={{ fontSize: 16, mr: 0.5, color: COLORS.primary }} />
        <Typography variant="caption" color={COLORS.primary}>
          Click to open →
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Sub-component: Navigation Breadcrumbs - Responsive Version
// Sub-component: Navigation Breadcrumbs - Responsive Version (No separators)
const BreadcrumbNav = ({ officeId, officeCode, employeeName, onNavigate }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1,
      mb: 2
    }}
  >
    <Button
      onClick={(e) => {
        e.preventDefault();
        onNavigate('/');
      }}
      startIcon={<HomeIcon />}
      size="small"
      sx={{
        minHeight: '32px',
        px: { xs: 1.5, sm: 2 },
        py: 0.5,
        border: '1px solid #000f57',
        color: '#000f57',
        backgroundColor: 'transparent',
        fontSize: { xs: '0.7rem', sm: '0.8rem' },
        '&:hover': {
          backgroundColor: '#000f57',
          color: 'white',
          borderColor: '#000f57'
        }
      }}
    >
      Dashboard
    </Button>
    
    {officeId && (
      <Button
        onClick={(e) => {
          e.preventDefault();
          onNavigate(`/office/${officeId}/employees`);
        }}
        startIcon={<BusinessIcon />}
        size="small"
        sx={{
          minHeight: '32px',
          px: { xs: 1.5, sm: 2 },
          py: 0.5,
          border: '1px solid #000f57',
          color: '#000f57',
          backgroundColor: 'transparent',
          fontSize: { xs: '0.7rem', sm: '0.8rem' },
          '&:hover': {
            backgroundColor: '#000f57',
            color: 'white',
            borderColor: '#000f57'
          }
        }}
      >
        {officeCode || 'Office'}
      </Button>
    )}
    
    <Button
      startIcon={<PersonIcon />}
      size="small"
      sx={{
        minHeight: '32px',
        px: { xs: 1.5, sm: 2 },
        py: 0.5,
        backgroundColor: '#000f57',
        color: 'white',
        border: '1px solid #000f57',
        fontSize: { xs: '0.7rem', sm: '0.8rem' },
        '&:hover': {
          backgroundColor: '#000f57',
          color: 'white',
          borderColor: '#000f57'
        },
        maxWidth: { xs: '180px', sm: 'none' },
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {employeeName.length > 20 ? `${employeeName.substring(0, 18)}...` : employeeName}
    </Button>
  </Box>
);

// Sub-component: Session Banner
const SessionBanner = ({ employeeName, onLogout }) => (
  <Paper
    sx={{
      mb: 4,
      p: 2,
      bgcolor: COLORS.success,
      color: 'white',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexWrap: 'wrap'
    }}
  >
    <CheckCircleIcon />
    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
      Welcome back, {employeeName}! You are viewing your personal records.
    </Typography>
    <Button
      variant="outlined"
      color="inherit"
      size="small"
      onClick={onLogout}
      sx={{ ml: { xs: 0, sm: 'auto' }, color: 'white', borderColor: 'white' }}
    >
      Logout
    </Button>
  </Paper>
);

// Sub-component: Personal Info Section
const PersonalInfoSection = ({ employee }) => (
  <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, color: COLORS.primary, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Personal Information
      </Typography>

      <Grid container spacing={2}>
        {INFO_FIELDS.map((field) => {
          const value = employee[field.key];
          if (!value && field.key !== 'email' && field.key !== 'phone' && field.key !== 'join_date') {
            return null;
          }
          return (
            <Grid item xs={12} sm={6} md={field.fullWidth ? 12 : 6} key={field.key}>
              <InfoField icon={field.icon} label={field.label} value={value} />
            </Grid>
          );
        })}
      </Grid>
    </CardContent>
  </Card>
);

// Sub-component: Documents Section
const DocumentsSection = ({ documents, onOpenLink, getFileIcon }) => (
  <>
    <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3, color: COLORS.primary, fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
      📁 Credentials & Documents
      <Chip label={`${documents.length} item(s)`} size="small" sx={{ ml: 2 }} />
    </Typography>

    {documents.length === 0 ? (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No documents available for this employee.
      </Alert>
    ) : (
      <Grid container spacing={2}>
        {documents.map((doc, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <DocumentCard doc={doc} onOpen={onOpenLink} getIcon={getFileIcon} />
          </Grid>
        ))}
      </Grid>
    )}
  </>
);

const EmployeeCredentials = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // State
  const [employeeData, setEmployeeData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmployeeSession, setIsEmployeeSession] = useState(false);
  const [office, setOffice] = useState({ id: null, name: '', code: '' });

  // Initialize office data from location state or sessionStorage
  useEffect(() => {
    const state = location.state;
    if (state?.officeId) {
      const officeData = { id: state.officeId, name: state.officeName || '', code: state.officeCode || '' };
      setOffice(officeData);
      sessionStorage.setItem('lastOfficeId', state.officeId);
      sessionStorage.setItem('lastOfficeName', state.officeName || '');
      sessionStorage.setItem('lastOfficeCode', state.officeCode || '');
    } else {
      const savedOfficeId = sessionStorage.getItem('lastOfficeId');
      const savedOfficeName = sessionStorage.getItem('lastOfficeName');
      const savedOfficeCode = sessionStorage.getItem('lastOfficeCode');
      if (savedOfficeId) {
        setOffice({ id: savedOfficeId, name: savedOfficeName || '', code: savedOfficeCode || '' });
      }
    }
  }, [location.state]);

  // Check for employee session
  useEffect(() => {
    const session = localStorage.getItem('employee_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setIsEmployeeSession(sessionData.employee_id === employeeId);
      } catch (e) {
        console.error('Session error:', e);
      }
    }
  }, [employeeId]);

  // Fetch employee details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employee, docs] = await Promise.all([
          googleSheets.getEmployeeDetails(employeeId),
          googleSheets.getEmployeeDocuments(employeeId),
        ]);
        setEmployeeData(employee);
        setDocuments(docs);
        setError(null);
      } catch (err) {
        setError('Failed to load employee details');
        console.error('Error fetching employee details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  // Get file icon based on document type
  const getFileIcon = useCallback((doc) => {
    const url = doc.file_url || '';

    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return <FolderIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: COLORS.warning }} />;
    }

    if (doc.doc_type === 'image' || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: COLORS.success }} />;
    }

    if (doc.doc_type === 'pdf' || url.match(/\.pdf$/i)) {
      return <PictureAsPdfIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: COLORS.error }} />;
    }

    return <DescriptionIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: COLORS.info }} />;
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('employee_session');
    navigate('/employee-portal');
  }, [navigate]);

  // Handle open link
  const handleOpenLink = useCallback((url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener noreferrer');
  }, []);

  // Navigation handler
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <FlowerSpinner />
      </Box>
    );
  }

  // Error state
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Not found state
  if (!employeeData) {
    return <Alert severity="warning">Employee not found</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2, md: 3 }, mt: 2, mb: 4 }}>
      <Paper 
        variant="outlined" 
        sx={{ 
          mb: 3, 
          p: { xs: 1.5, sm: 2, md: 3 }, 
          borderRadius: 2, 
          bgcolor: 'white', 
          borderColor: 'rgba(15,31,71,0.12)' 
        }}
      >
        <BreadcrumbNav
          officeId={office.id}
          officeCode={office.code}
          employeeName={employeeData.name}
          onNavigate={handleNavigate}
        />

        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          sx={{ mt: 2 }}
        >
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 1.2, color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              Employee overview
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                mt: 0.5, 
                color: COLORS.primary,
                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              {employeeData.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 0.5, 
                maxWidth: { xs: '100%', md: 580 },
                fontSize: { xs: '0.7rem', sm: '0.8rem' }
              }}
            >
              {employeeData.position || 'No position information available.'}
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: { xs: 1, sm: 0 } }}>
            <Chip 
              icon={<BadgeIcon />} 
              label={`ID: ${employeeData.employee_id}`} 
              size="small" 
              sx={{ height: { xs: 24, sm: 28 }, '& .MuiChip-label': { fontSize: { xs: '0.65rem', sm: '0.7rem' } } }}
            />
            <Chip
              icon={<BusinessIcon />}
              label={office.name || `Office ${employeeData.office_id}`}
              size="small"
              variant="outlined"
              sx={{ height: { xs: 24, sm: 28 }, '& .MuiChip-label': { fontSize: { xs: '0.65rem', sm: '0.7rem' } } }}
            />
            <Chip
              label={employeeData.status || 'No status'}
              size="small"
              color={employeeData.status === 'Active' ? 'success' : 'default'}
              sx={{ height: { xs: 24, sm: 28 }, '& .MuiChip-label': { fontSize: { xs: '0.65rem', sm: '0.7rem' } } }}
            />
          </Box>
        </Box>
      </Paper>

      {isEmployeeSession && (
        <SessionBanner employeeName={employeeData.name} onLogout={handleLogout} />
      )}

      <PersonalInfoSection employee={employeeData} />

      <DocumentsSection
        documents={documents}
        onOpenLink={handleOpenLink}
        getFileIcon={getFileIcon}
      />
    </Container>
  );
};

export default EmployeeCredentials;