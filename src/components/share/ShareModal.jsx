import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Alert,
  Divider,
  Button
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { X, Link as LinkIcon, Github } from 'lucide-react';
import InviteSection from './InviteSection';
import AccessControl from './AccessControl';
import ShareTabs from './ShareTabs';
import ShareSettingsScreen from './ShareSettingsScreen';
import GithubTab from './GithubTab';
import CopyLinkTab from './CopyLinkTab';
import PublishCommunityModal from './PublishCommunityModal';
import { SuccessScreen, FailureScreen } from './FeedbackScreens';
import {
  getGithubRepos,
  createGithubRepo,
  pushToGithub
} from '../../services/githubService';
import { inviteUsers } from '../../services/shareService';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const ShareModal = ({ open, onClose }) => {
  const [view, setView] = useState('main'); // 'main', 'settings', 'github'
  const [activeTab, setActiveTab] = useState('link');
  const [link] = useState(window.location.href);
  const [access, setAccess] = useState('anyone');
  const [permission, setPermission] = useState('view');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [publishToMarketplace, setPublishToMarketplace] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [emails, setEmails] = useState([]);
  const [people, setPeople] = useState([
    { id: '1', name: 'You', email: 'test888@gmail.com', role: 'Owner', avatar: 'Y', color: '#64748b' }
  ]);

  // GitHub state
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [repoId, setRepoId] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await getGithubRepos();
      if (res && Array.isArray(res)) {
        setRepos(res.map(r => ({ id: r.id || r.name, name: r.name })));
      } else if (res && res.data) {
        setRepos(res.data.map(r => ({ id: r.id || r.name, name: r.name })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 'github') {
      setView('github');
      if (isFirstTime) {
        fetchRepos();
      }
    } else if (newValue === 'marketplace') {
      onClose();
      setIsPublishModalOpen(true);
    } else {
      setView('main');
    }
    setError('');
    setSuccess(false);
  };

  const handleCopy = () => {
    if (passwordEnabled && !password) {
      setError('Password is required for protection');
      return;
    }
    setError('');
    navigator.clipboard.writeText(link);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    console.log('Link copied!');
  };

  const handleAddEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }
    setError('');
    if (!emails.includes(email)) setEmails([...emails, email]);
  };

  const handleRemoveEmail = (email) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleInvite = async () => {
    if (emails.length === 0) return;

    setLoading(true);
    setError('');

    try {
      await inviteUsers(emails, link);

      const colors = ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6'];
      const newPeople = emails.map((email, index) => ({
        id: Date.now() + index,
        name: email.split('@')[0],
        email: email,
        role: 'Can View',
        avatar: email[0].toUpperCase(),
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setPeople([...people, ...newPeople]);
      setEmails([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send invites.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRepo = async () => {
    if (!repoId) return;
    setLoading(true);
    setError('');
    try {
      await createGithubRepo(repoId, branch);
      const newRepo = { id: Date.now().toString(), name: repoId };
      setRepos([...repos, newRepo]);
      setSelectedRepo(newRepo);
      setIsFirstTime(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to link repository.');
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!commitMessage) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const files = [
        {
          Path: "Testproject/Testfile.js",
          content: "Test content testing"
        }
      ];
      await pushToGithub(files, commitMessage);
      setSuccess(true);
      setCommitMessage('');
    } catch (err) {
      console.error(err);
      setError('Push failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '16px', p: 1, backgroundColor: '#ffffff' }
          }}
        >
          {success && activeTab === 'github' ? (
            <SuccessScreen
              onClose={() => { setSuccess(false); setView('main'); setActiveTab('link'); }}
            />
          ) : error && activeTab === 'github' ? (
            <FailureScreen
              onClose={() => setError('')}
              message={error}
            />
          ) : view === 'settings' ? (
            <DialogContent sx={{ p: 3 }}>
              <ShareSettingsScreen
                onBack={() => setView('main')}
                onClose={onClose}
                access={access}
                onAccessChange={setAccess}
                permission={permission}
                onPermissionChange={setPermission}
                passwordRequired={passwordEnabled}
                onPasswordToggle={setPasswordEnabled}
                password={password}
                onPasswordChange={setPassword}
                publishToMarketplace={publishToMarketplace}
                onPublishToMarketplaceToggle={setPublishToMarketplace}
                onSubmitSettings={({ localPublish }) => {
                  setView('main');
                  if (localPublish) {
                    onClose();
                    setIsPublishModalOpen(true);
                  }
                }}
              />
            </DialogContent>
          ) : (
            <>
              <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>Share this file</Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
                  <X size={20} />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 2, '&::-webkit-scrollbar': { width: '8px' } }}>
                <ShareTabs activeTab={activeTab} onTabChange={handleTabChange} />

                {view === 'main' ? (
                  <Box>
                    <Box sx={{ mt: 2 }}>
                      <InviteSection
                        emails={emails}
                        onAddEmail={handleAddEmail}
                        onRemoveEmail={handleRemoveEmail}
                        onInvite={handleInvite}
                      />
                    </Box>
                    <CopyLinkTab link={link} onCopy={handleCopy} />
                    <AccessControl
                      access={access}
                      permission={permission}
                      people={people}
                      onNavigateToSettings={() => setView('settings')}
                    />
                    {error && activeTab === 'link' && <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>{error}</Alert>}
                    {success && activeTab === 'link' && <Alert severity="success" sx={{ mt: 2, borderRadius: '8px' }}>Link copied to clipboard!</Alert>}

                    <Box sx={{ mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={onClose}
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: '#1e3a8a',
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'none',
                          h: 44
                        }}
                      >
                        Done
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <GithubTab
                    isFirstTime={isFirstTime}
                    repoId={repoId}
                    onRepoIdChange={setRepoId}
                    onSaveRepo={handleSaveRepo}
                    repos={repos}
                    selectedRepo={selectedRepo}
                    onRepoChange={setSelectedRepo}
                    branch={branch}
                    onBranchChange={setBranch}
                    commitMessage={commitMessage}
                    onCommitChange={setCommitMessage}
                    onPush={handlePush}
                    loading={loading}
                    error={error}
                    success={success}
                  />
                )}
              </DialogContent>
            </>
          )}
        </Dialog>
      </ThemeProvider>

      <PublishCommunityModal
        open={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        projectName="INOVIEW, INNOMART, S..."
        authorName="Nandhini"
        onPublished={(data) => {
          console.log('Project published to Marketplace:', data);
        }}
      />
    </>
  );
};

export default ShareModal;
