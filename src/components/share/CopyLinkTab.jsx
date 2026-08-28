import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { Link as LinkIcon } from 'lucide-react';

const CopyLinkTab = ({ link, onCopy }) => {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
        Share link
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={link}
          autoComplete="off"
          InputProps={{
            readOnly: true,
            startAdornment: <LinkIcon size={16} style={{ marginRight: 8, color: '#64748b' }} />,
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f8fafc' } }}
        />
        <Button 
          variant="outlined" 
          onClick={onCopy}
          sx={{ 
            borderRadius: '8px', 
            textTransform: 'none', 
            px: 3, 
            borderColor: '#e2e8f0', 
            color: '#0f172a',
            fontWeight: 600
          }}
        >
          Copy
        </Button>
      </Box>
    </Box>
  );
};

export default CopyLinkTab;
