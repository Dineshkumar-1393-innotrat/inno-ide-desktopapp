import React from 'react';
import { Select, MenuItem, Box, Typography } from '@mui/material';

const BranchSelector = ({ branches = ['main', 'develop', 'feature'], branch, onBranchChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#64748b' }}>
        Select Branch
      </Typography>
      <Select
        fullWidth
        size="small"
        value={branch}
        onChange={(e) => onBranchChange(e.target.value)}
        sx={{ borderRadius: '8px' }}
      >
        {branches.map((b) => (
          <MenuItem key={b} value={b}>
            {b}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default BranchSelector;
