import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const SuccessScreen = ({ onClose, title, message }) => {
  return (
    <Box sx={{ p: 4, textAlign: 'center', position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <IconButton 
        onClick={onClose} 
        sx={{ position: 'absolute', top: 16, right: 16, color: '#64748b' }}
      >
        <X size={24} />
      </IconButton>
      
      <Box sx={{ mb: 3 }}>
        <CheckCircle size={80} color="#22c55e" strokeWidth={1.5} />
      </Box>
      
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
        {title || 'Changes Pushed Successfully'}
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: '80%', mx: 'auto' }}>
        {message || 'Your code has been synchronised with the repository.'}
      </Typography>

      <Button 
        variant="contained" 
        onClick={onClose}
        sx={{ 
          borderRadius: '8px', 
          px: 6, 
          py: 1.2,
          backgroundColor: '#1e3a8a',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#1e293b' }
        }}
      >
        Done
      </Button>
    </Box>
  );
};

export const FailureScreen = ({ onClose, title, message }) => {
  return (
    <Box sx={{ p: 4, textAlign: 'center', position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <IconButton 
        onClick={onClose} 
        sx={{ position: 'absolute', top: 16, right: 16, color: '#64748b' }}
      >
        <X size={24} />
      </IconButton>
      
      <Box sx={{ mb: 3 }}>
        <AlertCircle size={80} color="#ef4444" strokeWidth={1.5} />
      </Box>
      
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
        {title || 'Push Failed'}
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4, maxWidth: '80%', mx: 'auto' }}>
        {message || 'There was an error pushing your changes. Please check your authentication and try again.'}
      </Typography>

      <Button 
        variant="contained" 
        onClick={onClose}
        sx={{ 
          borderRadius: '8px', 
          px: 6, 
          py: 1.2,
          backgroundColor: '#1e3a8a',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none'
        }}
      >
        Done
      </Button>
    </Box>
  );
};
