import React from 'react';
import { Box, Typography, Switch, TextField, FormControlLabel } from '@mui/material';

const PasswordField = ({ enabled, onEnabledToggle, password, onPasswordChange }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={enabled}
            onChange={onEnabledToggle}
          />
        }
        label={<Typography variant="body2">Password protection</Typography>}
      />
      {enabled && (
        <TextField
          fullWidth
          size="small"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          sx={{ 
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />
      )}
    </Box>
  );
};

export default PasswordField;
