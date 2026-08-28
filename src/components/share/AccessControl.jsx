import { Box, Typography, Avatar, Stack, Select, MenuItem, Divider } from '@mui/material';
import { Globe, ChevronRight, User } from 'lucide-react';

const AccessControl = ({ access, permission, people = [], onNavigateToSettings }) => {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#475569' }}>
        Who Has Access ?
      </Typography>
      
      <Stack spacing={2}>
        {people.map((person) => (
          <Box key={person.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  bgcolor: person.color || '#f1f5f9', 
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {person.avatar ? person.avatar : <User size={20} />}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {person.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: -0.5 }}>
                  {person.email}
                </Typography>
              </Box>
            </Box>
            {person.role === 'Owner' ? (
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', pr: 1 }}>
                Owner
              </Typography>
            ) : (
              <Select
                value={person.role || 'Can View'}
                size="small"
                variant="standard"
                disableUnderline
                sx={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#64748b',
                  '& .MuiSelect-select': { py: 0.5, pr: '24px !important' }
                }}
              >
                <MenuItem value="Can View">Can View</MenuItem>
                <MenuItem value="Can Edit">Can Edit</MenuItem>
              </Select>
            )}
          </Box>
        ))}

        <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />

        {/* Anyone with link row */}
        <Box 
          onClick={onNavigateToSettings}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            margin: '0 -8px',
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: '#f1f5f9' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box 
              sx={{ 
                width: 38, 
                height: 38, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#3b82f6'
              }}
            >
              <Globe size={20} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {access === 'anyone' ? 'Anyone With Link' : 'Restricted'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: -0.5 }}>
                {access === 'anyone' ? 'Anyone with the link can access' : 'Only people added can access'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
              {permission === 'view' ? 'Can View' : 'Can Edit'}
            </Typography>
            <ChevronRight size={16} color="#94a3b8" />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default AccessControl;
