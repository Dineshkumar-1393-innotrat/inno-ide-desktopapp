import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Select, MenuItem, IconButton, Stack, Autocomplete, Collapse } from '@mui/material';
import { RefreshCw, Database, CheckCircle2, Key, ChevronDown, ChevronUp, Github } from 'lucide-react';
import RepoSelector from './RepoSelector';
import BranchSelector from './BranchSelector';

const GithubTab = ({ 
  isFirstTime, 
  repoId, 
  onRepoIdChange, 
  githubToken = '',
  onGithubTokenChange = () => {},
  githubOwner = '',
  onGithubOwnerChange = () => {},
  onSaveRepo,
  repos = [],
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
  const [showCreds, setShowCreds] = useState(() => !githubToken);

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

          {/* GitHub Credentials Section (Optional / Token Update) */}
          <Box sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
            <Box 
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowCreds(!showCreds)}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Key size={14} color="#2563eb" /> GitHub Credentials / Personal Access Token
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#2563eb' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {showCreds ? 'Hide' : (githubToken ? 'Change' : 'Configure')}
                </Typography>
                {showCreds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </Box>
            </Box>

            <Collapse in={showCreds}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: '#475569', display: 'block' }}>
                    GitHub Username / Account
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. srilakshmi415"
                    value={githubOwner}
                    onChange={(e) => onGithubOwnerChange(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#ffffff', fontSize: '0.875rem' } }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: '#475569', display: 'block' }}>
                    Personal Access Token (PAT)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    placeholder="ghp_... or github_pat_..."
                    value={githubToken}
                    onChange={(e) => onGithubTokenChange(e.target.value)}
                    helperText="Required if not connected or if existing token expired. Requires 'repo' scope."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#ffffff', fontSize: '0.875rem' } }}
                  />
                </Box>
              </Box>
            </Collapse>
          </Box>

          <Button 
            variant="contained" 
            fullWidth
            onClick={onSaveRepo}
            disabled={!repoId || loading}
            startIcon={!loading && <Github size={18} />}
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
            {loading ? 'Linking...' : 'Link And Push'}
          </Button>

          {error && <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>}
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
                  {selectedRepo?.name || repoId || 'Innotrat Project'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Branch {branch || 'Main'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => setShowCreds(!showCreds)} title="Update Token">
              <Key size={16} />
            </IconButton>
          </Box>

          <Collapse in={showCreds}>
            <Box sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                Update Personal Access Token (PAT)
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="ghp_... or github_pat_..."
                value={githubToken}
                onChange={(e) => onGithubTokenChange(e.target.value)}
                helperText="Paste new PAT if push fails with authentication/token errors."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px', backgroundColor: '#ffffff', fontSize: '0.875rem' } }}
              />
            </Box>
          </Collapse>

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
              startIcon={!loading && <Github size={18} />}
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

