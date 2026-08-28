import React from 'react';
import { Select, MenuItem, Box, Typography } from '@mui/material';

const RepoSelector = ({ repos, selectedRepo, onRepoChange }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#64748b' }}>
        Select Repository
      </Typography>
      <Select
        fullWidth
        size="small"
        value={selectedRepo ? selectedRepo.id : ''}
        onChange={(e) => {
          const repo = repos.find(r => r.id === e.target.value);
          onRepoChange(repo);
        }}
        sx={{ borderRadius: '8px' }}
      >
        {repos.map((repo) => (
          <MenuItem key={repo.id} value={repo.id}>
            {repo.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default RepoSelector;
