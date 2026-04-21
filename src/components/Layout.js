import React from 'react';
import { AppBar, Toolbar, Box, Container, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(90deg, #000f57 0%, #929094 100%)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Box
            component="img"
            src="/mgh-logo.png"
            alt="Magsaysay GovEmployee Hub"
            sx={{
              height: 55,
              width: 'auto',
              cursor: 'pointer',
              mr: 2
            }}
            onClick={() => navigate('/')}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;