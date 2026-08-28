import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { Link as LinkIcon, Github, Store } from 'lucide-react';

const ShareTabs = ({ activeTab, onTabChange }) => {
  return (
    <Tabs 
      value={activeTab} 
      onChange={(e, val) => onTabChange(e, val)}
      sx={{ 
        borderBottom: '1px solid #e2e8f0',
        mb: 2,
        '& .MuiTabs-indicator': { height: '3px', borderRadius: '3px' }
      }}
    >
      <Tab 
        label="Copy Link" 
        value="link" 
        icon={<LinkIcon size={18} />} 
        iconPosition="start" 
        sx={{ textTransform: 'none', fontWeight: 600, minHeight: '48px' }}
      />
      <Tab 
        label="GitHub" 
        value="github" 
        icon={<Github size={18} />} 
        iconPosition="start" 
        sx={{ textTransform: 'none', fontWeight: 600, minHeight: '48px' }}
      />
      <Tab 
        label="Marketplace" 
        value="marketplace" 
        icon={<Store size={18} />} 
        iconPosition="start" 
        sx={{ textTransform: 'none', fontWeight: 600, minHeight: '48px' }}
      />
    </Tabs>
  );
};

export default ShareTabs;
