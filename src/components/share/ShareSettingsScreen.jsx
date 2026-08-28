import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  TextField,
  Button
} from '@mui/material';
import { ChevronLeft, X } from 'lucide-react';

const ShareSettingsScreen = ({ 
  onBack, 
  onClose,
  access = 'anyone',
  onAccessChange,
  permission = 'view',
  onPermissionChange,
  passwordRequired = false,
  onPasswordToggle,
  password = '',
  onPasswordChange,
  publishToMarketplace = false,
  onPublishToMarketplaceToggle,
  onSubmitSettings
}) => {
  const [localPublish, setLocalPublish] = useState(publishToMarketplace);

  const handleSubmit = () => {
    if (onSubmitSettings) {
      onSubmitSettings({ localPublish });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} size="small" sx={{ mr: 1, color: '#64748b' }}>
          <ChevronLeft size={20} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, color: '#0f172a' }}>
          Share Settings
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <X size={20} />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
          Who Can Access
        </Typography>
        <Select
          fullWidth
          value={access}
          onChange={(e) => onAccessChange && onAccessChange(e.target.value)}
          size="small"
          sx={{ borderRadius: '8px', backgroundColor: '#f8fafc' }}
        >
          <MenuItem value="restricted">Restricted</MenuItem>
          <MenuItem value="anyone">Anyone</MenuItem>
        </Select>
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#94a3b8' }}>
          {access === 'anyone' ? 
            'Anyone, Even Those Outside Your Organisation, Will Be Able To Access This File' : 
            'Only People added can open with this link'
          }
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
          What Can They Do
        </Typography>
        <RadioGroup
          value={permission}
          onChange={(e) => onPermissionChange && onPermissionChange(e.target.value)}
          sx={{ pl: 1 }}
        >
          <FormControlLabel 
            value="view" 
            control={<Radio size="small" />} 
            label={<Typography variant="body2">Can View</Typography>} 
          />
          <FormControlLabel 
            value="edit" 
            control={<Radio size="small" />} 
            label={<Typography variant="body2">Can Edit</Typography>} 
          />
        </RadioGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
          Additional Security
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={passwordRequired} 
                onChange={(e) => onPasswordToggle && onPasswordToggle(e.target.checked)} 
                size="small" 
              />
            }
            label={<Typography variant="body2">Password Required</Typography>}
          />
          {passwordRequired && (
            <TextField
              fullWidth
              placeholder="Enter Password"
              type="password"
              size="small"
              value={password}
              onChange={(e) => onPasswordChange && onPasswordChange(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#ffffff' } 
              }}
            />
          )}

          <FormControlLabel
            control={
              <Checkbox 
                checked={localPublish} 
                onChange={(e) => {
                  setLocalPublish(e.target.checked);
                  onPublishToMarketplaceToggle && onPublishToMarketplaceToggle(e.target.checked);
                }} 
                size="small" 
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563eb' }}>
                Publish To Marketplace
              </Typography>
            }
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
        <Button
          variant="outlined"
          onClick={onBack || onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            borderColor: '#cbd5e1',
            color: '#475569',
            '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#1d4ed8' }
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ShareSettingsScreen;
