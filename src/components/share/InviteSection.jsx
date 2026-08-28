import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack } from '@mui/material';
import { Mail, Info } from 'lucide-react';

const InviteSection = ({ emails, onAddEmail, onRemoveEmail, onInvite }) => {
  const [emailInput, setEmailInput] = useState('');

  const handleAdd = () => {
    if (emailInput && !emails.includes(emailInput)) {
      onAddEmail(emailInput);
      setEmailInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#eff6ff', 
          color: '#1d4ed8', 
          padding: '10px 16px', 
          borderRadius: '8px',
          mb: 2,
          gap: 1.5
        }}
      >
        <Info size={18} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          To Invite People Into Your Project
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 0, position: 'relative', mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add Emails To Invite"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '8px 0 0 8px',
              backgroundColor: '#ffffff'
            } 
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleAdd} 
          sx={{ 
            borderRadius: '0 8px 8px 0', 
            textTransform: 'none', 
            boxShadow: 'none',
            backgroundColor: '#1e3a8a',
            px: 3,
            '&:hover': { backgroundColor: '#1e293b' }
          }}
        >
          Invite
        </Button>
      </Box>
      
      {emails.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {emails.map((email) => (
            <Chip
              key={email}
              label={email}
              onDelete={() => onRemoveEmail(email)}
              sx={{ borderRadius: '6px', backgroundColor: '#f1f5f9' }}
            />
          ))}
        </Stack>
      )}

      <Button 
        fullWidth 
        variant="contained" 
        onClick={onInvite}
        disabled={emails.length === 0}
        sx={{ 
          borderRadius: '8px', 
          py: 1.25, 
          textTransform: 'none', 
          fontWeight: 600, 
          boxShadow: 'none',
          backgroundColor: '#1e3a8a',
          '&:hover': { backgroundColor: '#1e293b' }
        }}
      >
        Send Invites
      </Button>
    </Box>
  );
};

export default InviteSection;
