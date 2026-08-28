import { Box, Typography, TextField, Button, Alert, Select, MenuItem, IconButton, Stack, Autocomplete } from '@mui/material';
import { X, RefreshCw, Database, CheckCircle2 } from 'lucide-react';
import RepoSelector from './RepoSelector';
import BranchSelector from './BranchSelector';

const GithubTab = ({ 
  isFirstTime, 
  repoId, 
  onRepoIdChange, 
  onSaveRepo,
  repos,
  selectedRepo,
  onRepoChange,
  branch,
  onBranchChange,
  commitMessage,
  onCommitChange,
  onPush,
  loading,
  error,
  success
}) => {
  return (
    <Box sx={{ py: 2 }}>
      {isFirstTime ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
                Select Repository
              </Typography>
              <Autocomplete
                freeSolo
                options={repos.map(r => r.name)}
                value={repoId}
                onInputChange={(event, newInputValue) => onRepoIdChange(newInputValue)}
                onChange={(event, newValue) => onRepoIdChange(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select Repository"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#ffffff' } }}
                  />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
                Select Branch
              </Typography>
              <Select
                fullWidth
                size="small"
                value="main"
                disabled
                sx={{ borderRadius: '8px', backgroundColor: '#f1f5f9' }}
              >
                <MenuItem value="main">Main (Default)</MenuItem>
              </Select>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            fullWidth
            onClick={onSaveRepo}
            disabled={!repoId}
            sx={{ 
              borderRadius: '8px', 
              py: 1, 
              textTransform: 'none', 
              fontWeight: 600, 
              boxShadow: 'none',
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1e293b' }
            }}
          >
            Link And Push
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Project/Branch Header */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              backgroundColor: '#fafafa'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ color: '#1e3a8a' }}>
                <Database size={20} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {selectedRepo?.name || 'Innotrat Project'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Branch {branch || 'Main'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: '#3b82f6' }}>
              <RefreshCw size={18} />
            </IconButton>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>
              Add Commit Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Update Firmware Logic"
              value={commitMessage}
              onChange={(e) => onCommitChange(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '12px', 
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: '#e2e8f0' }
                } 
              }}
            />
          </Box>

          {/* Sync Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
            <Box sx={{ color: '#3b82f6' }}>
              <CheckCircle2 size={16} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Local Changes Are Staged And Ready For Synchronisation
            </Typography>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => { onCommitChange(''); }}
              sx={{ 
                borderRadius: '8px', 
                py: 1.25, 
                textTransform: 'none', 
                fontWeight: 600, 
                color: '#64748b',
                borderColor: '#e2e8f0',
                '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={onPush}
              disabled={loading || !commitMessage}
              startIcon={!loading && <X size={18} />} // Using X as a generic icon or Github if available
              sx={{ 
                borderRadius: '8px', 
                py: 1.25, 
                textTransform: 'none', 
                fontWeight: 700, 
                boxShadow: 'none',
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1e293b' }
              }}
            >
              {loading ? 'Pushing...' : 'Push'}
            </Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mt: 1, borderRadius: '8px' }}>{error}</Alert>}
        </Box>
      )}
    </Box>
  );
};

export default GithubTab;
