import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMeeting } from '../contexts/MeetingContext';
import {
  Blocks,
  Braces,
  ChevronDown,
  BookOpen,
  Download,
  Presentation,
  Save,
  Settings,
  Upload,
  UserCircle,
  Video,
  ImageDown,
  RotateCcw,
  RotateCw,
  BugPlay,
  Zap,
  Terminal,
  Plus,
  Cog,
  Hammer,
  Loader2,
  Trash,
  Radio,
  Library,
  Workflow,
  Database,
  Cpu,
  Boxes,
  Calculator,
  Brain,
} from 'lucide-react';
import './EditorNavbar.css';
import hexLogo from '../assets/hex_bg.png';
import DyteMeetingApp from './DyteMeetingApp';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import ShareModal from './share/ShareModal';
import RuleEngineModal from './RuleEngine/RuleEngineModal';
import { IconButton } from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';
import { useProject } from '../ProjectContext';
// import DyteMeetingLauncher from './DyteMeetingLauncher';

const IDENTITY_FIELDS = [
  'name',
  'fullName',
  'username',
  'userName',
  'email',
  'userEmail',
  'mail',
  'phone',
  'mobileNumber',
  'phoneNumber',
];

const parseMaybeJSON = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse stored identity', error);
    return null;
  }
};

const hasIdentityInfo = (candidate) => {
  if (!candidate || typeof candidate !== 'object') return false;
  return IDENTITY_FIELDS.some((key) => {
    const value = candidate[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

const buildIdentity = (candidate) => {
  if (!hasIdentityInfo(candidate)) return null;

  const name =
    candidate.name ||
    candidate.fullName ||
    candidate.username ||
    candidate.userName ||
    '';
  const email = candidate.email || candidate.userEmail || candidate.mail || '';
  const phone = candidate.phone || candidate.mobileNumber || candidate.phoneNumber || '';

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

  const primary = trimmedName || trimmedEmail || trimmedPhone;
  if (!primary) return null;

  return {
    ...candidate,
    name: trimmedName || primary,
    email: trimmedEmail,
    phone: trimmedPhone,
  };
};

const loadIdentityFromStorage = () => {
  if (typeof window === 'undefined') return null;

  const sources = [
    () => window.sessionStorage.getItem('currentUserIdentity'),
    () => window.localStorage.getItem('currentUserIdentity'),
    () => window.sessionStorage.getItem('userData'),
    () => window.localStorage.getItem('userData'),
  ];

  for (const read of sources) {
    const parsed = buildIdentity(parseMaybeJSON(read()));
    if (parsed) {
      return parsed;
    }
  }

  return null;
};
const DEFAULT_TABS = ['Block Diagram', 'Flowchart', 'Simulation', 'Code Editor', 'Block Programming', 'MathCodeEditor', 'Dynamic Rule Engine'];

const TAB_ICON_MAP = {
  'Block Diagram': Blocks,
  Flowchart: Workflow,
  Simulation: Cpu,
  'Code Editor': Braces,
  'Block Programming': Boxes,
  'MathCodeEditor': Calculator,
  'Dynamic Rule Engine': Brain,
};

import { onboardingSteps } from '../data/onboardingSteps';

const EditorNavbar = ({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  onSaveJSON,
  onLoadJSON,
  onExportPNG,
  onUndo,
  onRedo,
  onCreateNewProject,
  onLibrariesClick,
  user,
  onLogout,
  loginPath = '/',
  isDeviceConnected = true,
}) => {
  const navigate = useNavigate();
  const { logout: projectLogout } = useProject?.() ?? {};
  const { toggleMeeting } = useMeeting();
  const [accountOpen, setAccountOpen] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const downloadRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRefs = {
    file: useRef(null),
    tools: useRef(null),
    help: useRef(null),
  };
  const [isHelpReferenceOpen, setHelpReferenceOpen] = useState(false);
  const [helpStep, setHelpStep] = useState(0);

  const [isCompiling, setIsCompiling] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [isSerialActive, setIsSerialActive] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRuleEngineOpen, setIsRuleEngineOpen] = useState(false);

  useEffect(() => {
    if (!accountOpen && !activeMenu && !downloadMenuOpen) return;
    const handlePointer = (event) => {
      const clickedAccount = accountRef.current?.contains(event.target);
      const clickedMenu = Object.values(menuRefs).some((ref) => ref.current?.contains(event.target));
      const clickedDownload = downloadRef.current?.contains(event.target);
      if (!clickedAccount) {
        setAccountOpen(false);
      }
      if (!clickedMenu) {
        setActiveMenu(null);
      }
      if (!clickedDownload) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [accountOpen, activeMenu, downloadMenuOpen]);

  useEffect(() => {
    if (!accountOpen && !activeMenu && !isHelpReferenceOpen && !downloadMenuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        setActiveMenu(null);
        setHelpReferenceOpen(false);
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [accountOpen, activeMenu, isHelpReferenceOpen, downloadMenuOpen]);

  const handleLogout = () => {
    Promise.resolve(projectLogout?.()).then(() => {
      return Promise.resolve(onLogout?.());
    }).finally(() => {
      setAccountOpen(false);
      window.location.assign(loginPath);
    });
  };

  const resolvedUser = useMemo(() => {
    if (hasIdentityInfo(user)) {
      return buildIdentity(user);
    }
    return loadIdentityFromStorage();
  }, [user]);

  const displayEmail = (resolvedUser?.email || resolvedUser?.mail || '').trim();
  const displayPhone = (
    resolvedUser?.phone || resolvedUser?.mobileNumber || resolvedUser?.phoneNumber || ''
  ).trim();
  const displayName =
    (resolvedUser?.name || resolvedUser?.username || resolvedUser?.fullName || '').trim() ||
    'Guest';

  const handleCompile = useCallback(async () => {
    if (isCompiling) return;
    setIsCompiling(true);
    try {
      await Promise.resolve(onSaveJSON?.());
      window.dispatchEvent(new CustomEvent('innoide:compile-start'));
    } finally {
      setIsCompiling(false);
    }
  }, [isCompiling, onSaveJSON]);

  const handleBuild = useCallback(async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    try {
      window.dispatchEvent(new CustomEvent('innoide:build-start'));
      await new Promise((resolve) => setTimeout(resolve, 800));
      window.dispatchEvent(new CustomEvent('innoide:build-complete'));
    } finally {
      setIsBuilding(false);
    }
  }, [isBuilding]);

  const handleDebugger = useCallback(() => {
    const next = !isDebugging;
    setIsDebugging(next);
    window.dispatchEvent(new CustomEvent(next ? 'innoide:debugger-start' : 'innoide:debugger-stop'));
  }, [isDebugging]);

  const handleFlash = useCallback(() => {
    window.dispatchEvent(new CustomEvent('innoide:flash-start'));
  }, []);

  const handleErase = useCallback(async () => {
    if (isErasing) return;
    setIsErasing(true);
    try {
      window.dispatchEvent(new CustomEvent('innoide:erase-start'));
      await new Promise((resolve) => setTimeout(resolve, 600));
      window.dispatchEvent(new CustomEvent('innoide:erase-complete'));
    } finally {
      setIsErasing(false);
    }
  }, [isErasing]);

  const handleSerialMonitor = useCallback(() => {
    const next = !isSerialActive;
    setIsSerialActive(next);
    window.dispatchEvent(new CustomEvent(next ? 'innoide:serial-open' : 'innoide:serial-close'));
  }, [isSerialActive]);

  const handleTerminal = useCallback(() => {
    const next = !isTerminalOpen;
    setIsTerminalOpen(next);
    window.dispatchEvent(new CustomEvent(next ? 'innoide:terminal-open' : 'innoide:terminal-close'));
  }, [isTerminalOpen]);

  const handleUpdateShareSettings = async (settings) => {
    // call backend: PUT /api/projects/:id/share
    console.log('update share settings', settings);
  };

  const handleInviteContributors = async (emails, role) => {
    // call backend: POST /api/projects/:id/invite
    console.log('invite', emails, 'as', role);
  };

  const handleLibraries = useCallback(() => {
    if (typeof onLibrariesClick === 'function') {
      onLibrariesClick();
    } else {
      window.dispatchEvent(new CustomEvent('innoide:libraries-open'));
    }
    setActiveMenu(null);
  }, [onLibrariesClick]);

  const handleViewOutput = useCallback(() => {
    window.dispatchEvent(new CustomEvent('innoide:view-output'));
  }, []);

  const handleProblem = useCallback(() => {
    window.dispatchEvent(new CustomEvent('innoide:problem'));
  }, []);

  const handleDebugConsole = useCallback(() => {
    window.dispatchEvent(new CustomEvent('innoide:debug-console'));
  }, []);

  const handlePostman = useCallback(() => {
    window.dispatchEvent(new CustomEvent('innoide:postman'));
  }, []);

  const handleRestApi = useCallback(() => {
    window.dispatchEvent(new CustomEvent('innoide:rest-api'));
  }, []);

  const toolItems = useMemo(() => {
    return [
      {
        key: 'flash',
        label: 'Flash',
        icon: isFlashing ? <Loader2 size={14} className="spin" /> : <Zap size={14} />,
        handler: handleFlash,
      },
      {
        key: 'viewOutput',
        label: 'View Output',
        icon: <Presentation size={14} />,
        handler: handleViewOutput,
      },
      {
        key: 'problem',
        label: 'Problem',
        icon: <Hammer size={14} />,
        handler: handleProblem,
      },
      {
        key: 'debugConsole',
        label: 'Debug Console',
        icon: <BugPlay size={14} />,
        handler: handleDebugConsole,
      },
      {
        key: 'terminal',
        label: 'Terminal',
        icon: <Terminal size={14} />,
        handler: handleTerminal,
      },
      {
        key: 'postman',
        label: 'Postman',
        icon: <Radio size={14} />,
        handler: handlePostman,
      },
      {
        key: 'restApi',
        label: 'REST API',
        icon: <Database size={14} />,
        handler: handleRestApi,
      },
    ];
  }, [handleFlash, handleViewOutput, handleProblem, handleDebugConsole, handleTerminal, handlePostman, handleRestApi, isFlashing, isDeviceConnected]);

  const toggleMenu = (menuKey) => {
    setActiveMenu((current) => (current === menuKey ? null : menuKey));
    setAccountOpen(false);
    setDownloadMenuOpen(false);
  };

  const handleNewProject = () => {
    if (typeof onCreateNewProject === 'function') {
      onCreateNewProject();
    } else {
      window.dispatchEvent(new CustomEvent('innoide:create-new-project'));
    }
    setActiveMenu(null);
  };

  const handleToolClick = (handler) => {
    if (typeof handler === 'function') {
      handler();
    }
    setActiveMenu(null);
    setDownloadMenuOpen(false);
  };

  return (
    <header className={`editor-navbar ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="editor-navbar__left">
        {/* ✅ Mobile Menu Toggle */}
        <button
          className="editor-navbar__mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <span>✕</span> : <span>☰</span>}
        </button>

        {/* ✅ Brand with logo */}
        <div className="editor-navbar__brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img
            src={hexLogo}
            alt="InnoIDE Logo"
            className="editor-navbar__logo"
          />
          <span className="editor-navbar__brand-name">InnoIDE</span>
        </div>

        {/* ✅ Menu Items */}
        <nav className={`editor-navbar__menu ${isMobileMenuOpen ? 'is-visible' : ''}`}>
          <div className="editor-navbar__menu-group" ref={menuRefs.tools} style={{ display: 'none' }}>
            <button
              type="button"
              className={`editor-navbar__menu-item ${activeMenu === 'tools' ? 'is-open' : ''}`}
              onClick={() => toggleMenu('tools')}
            >
              <Settings size={16} />
              <span>Tools</span>
              <ChevronDown size={16} />
            </button>
            {activeMenu === 'tools' && (
              <div className="editor-navbar__menu-dropdown">
                {toolItems.length > 0 ? (
                  toolItems.map(({ key, label, icon, handler, disabled }) => (
                    <button
                      key={key}
                      type="button"
                      className={`editor-navbar__menu-action ${disabled ? 'is-disabled' : ''}`}
                      onClick={() => !disabled && handleToolClick(handler)}
                      disabled={disabled}
                      title={disabled ? 'Connect a device to use this feature' : label}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))
                ) : (
                  <div className="editor-navbar__menu-empty">No tools available</div>
                )}
              </div>
            )}
          </div>
          <div className="editor-navbar__menu-group" ref={menuRefs.help}>
            <button
              type="button"
              className={`editor-navbar__menu-item ${activeMenu === 'help' ? 'is-open' : ''}`}
              onClick={() => toggleMenu('help')}
            >
              <Presentation size={16} />
              <span>Help</span>
              <ChevronDown size={16} />
            </button>
            {activeMenu === 'help' && (
              <div className="editor-navbar__menu-dropdown">
                <button
                  type="button"
                  className="editor-navbar__menu-action"
                  onClick={() => {
                    setHelpReferenceOpen(true);
                    setActiveMenu(null);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <BookOpen size={14} />
                  <span>IDE Reference</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ✅ Tabs */}
      <div className="editor-navbar__tabs" role="tablist">
        {tabs.map((tab) => {
          const tabId = tab;
          const TabIcon = TAB_ICON_MAP[tabId];
          const isActive = tabId === activeTab;
          return (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`editor-navbar__tab ${isActive ? 'is-active' : ''}`}
              onClick={() => {
                if (tabId === 'MathCodeEditor') {
                  navigate('/mathcodeeditor');
                } else if (tabId === 'Block Diagram') {
                  navigate('/BlockDiagram');
                } else if (tabId === 'Block Programming') {
                  navigate('/blockprogramming');
                } else if (tabId === 'Dynamic Rule Engine') {
                  navigate('/rule-engine');
                } else {
                  onTabChange?.(tabId);
                }
              }}
            >
              {TabIcon && <TabIcon size={18} className="editor-navbar__tab-icon" aria-hidden="true" />}
              <span className="editor-navbar__tab-label">{tabId}</span>
            </button>
          );
        })}
      </div>

      {/* ✅ Right-side Icons */}
      <div className="editor-navbar__right">
        {(onExportPNG || onSaveJSON || onLoadJSON) && (
          <div
            className={`editor-navbar__download ${downloadMenuOpen ? 'is-open' : ''}`}
            ref={downloadRef}
          >
            <button
              type="button"
              className="editor-navbar__icon-btn"
              title="Download options"
              onClick={() => {
                setDownloadMenuOpen((open) => !open);
                setAccountOpen(false);
                setActiveMenu(null);
              }}
              aria-haspopup="menu"
              aria-expanded={downloadMenuOpen}
            >
              <div className="editor-navbar__icon-btn-inner">
                <Download size={18} />
                <ChevronDown size={14} className="editor-navbar__icon-caret" />
              </div>
            </button>
            {downloadMenuOpen && (
              <div className="editor-navbar__menu-dropdown editor-navbar__menu-dropdown--right" role="menu">
                {onLoadJSON && (
                  <button
                    type="button"
                    className="editor-navbar__menu-action"
                    onClick={() => {
                      onLoadJSON?.();
                      setDownloadMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <Upload size={14} />
                    <span>Load JSON</span>
                  </button>
                )}
                {onSaveJSON && (
                  <button
                    type="button"
                    className="editor-navbar__menu-action"
                    onClick={() => {
                      onSaveJSON?.();
                      setDownloadMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <Save size={14} />
                    <span>Save JSON</span>
                  </button>
                )}
                {onExportPNG && (
                  <button
                    type="button"
                    className="editor-navbar__menu-action"
                    onClick={() => {
                      onExportPNG?.();
                      setDownloadMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <ImageDown size={14} />
                    <span>Export PNG</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {/* Video Call Button */}
        <button
          type="button"
          className="editor-navbar__icon-btn"
          title="Video Call"
          onClick={toggleMeeting}
        >
          <Video size={18} />
        </button>

        {/* <button type="button" className="editor-navbar__icon-btn" title="Templates">
          <Braces size={18} />
        </button> */}
        <div className="editor-navbar__account" ref={accountRef}>
          <button
            type="button"
            className={`editor-navbar__account-btn ${accountOpen ? 'is-open' : ''}`}
            title="Account"
            onClick={() => setAccountOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
          >
            <UserCircle size={20} />
            <ChevronDown size={14} className="editor-navbar__account-caret" />
          </button>
          {accountOpen && (
            <div className="editor-navbar__account-menu" role="menu">
              <div className="editor-navbar__account-summary">
                <UserCircle size={36} />
                <div className="editor-navbar__account-name">{displayName}</div>
              </div>
              <button
                type="button"
                className="editor-navbar__account-menu-action"
                onClick={() => { setAccountOpen(false); navigate('/view-data'); }}
              >
                View Data
              </button>
              <button
                type="button"
                className="editor-navbar__account-menu-action"
                onClick={() => { setAccountOpen(false); navigate('/createproductdefination'); }}
              >
                View Product
              </button>
              <button type="button" className="editor-navbar__account-menu-item" onClick={handleLogout} role="menuitem">
                Logout
              </button>
            </div>
          )}
        </div>
        {/* Share button */}
        <IconButton
          onClick={() => setIsShareOpen(true)}
          title="Share"
          sx={{
            color: '#64748b',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            p: 1
          }}
        >
          <ShareIcon fontSize="small" />
        </IconButton>
      </div>

      <ShareModal
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <RuleEngineModal
        isOpen={isRuleEngineOpen}
        onClose={() => setIsRuleEngineOpen(false)}
      />

      {isHelpReferenceOpen && createPortal(
        <div className="editor-navbar__reference-overlay" role="dialog" aria-modal="true">
          <div className="editor-navbar__reference-modal">
            <header className="editor-navbar__reference-header">
              <BookOpen size={18} />
              <div>
                <h2>InnoIDE Walkthrough</h2>
                <p>Features & Recommended Workflow</p>
              </div>
              <button
                type="button"
                className="editor-navbar__reference-close"
                onClick={() => {
                  setHelpReferenceOpen(false);
                  setHelpStep(0);
                }}
                aria-label="Close reference"
              >
                &times;
              </button>
            </header>

            <div className="editor-navbar__onboarding-body">
              {/* Media Section */}
              {/* <div className="editor-navbar__onboarding-media">
                <div className="editor-navbar__video-placeholder">
                  {onboardingSteps[helpStep].videoUrl ? (
                    <video
                      key={helpStep}
                      src={onboardingSteps[helpStep].videoUrl}
                      className="editor-navbar__video-player"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <div className="video-empty-state">
                      <div className="play-icon-circle">
                        <span className="play-triangle">▶</span>
                      </div>
                      <span>Preview: {onboardingSteps[helpStep].title}</span>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Content Section */}
              <div className="editor-navbar__onboarding-content">
                <div className="onboarding-step-indicator">
                  Step {helpStep + 1} of {onboardingSteps.length}
                </div>
                <h3>{onboardingSteps[helpStep].title}</h3>
                <p>{onboardingSteps[helpStep].description}</p>
              </div>

              {/* Navigation Footer */}
              <div className="editor-navbar__onboarding-footer">
                <button
                  type="button"
                  className="onboarding-btn secondary"
                  disabled={helpStep === 0}
                  onClick={() => setHelpStep(s => Math.max(0, s - 1))}
                >
                  Previous
                </button>

                <div className="onboarding-dots">
                  {onboardingSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`onboarding-dot ${idx === helpStep ? 'active' : ''}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="onboarding-btn primary"
                  onClick={() => {
                    if (helpStep < onboardingSteps.length - 1) {
                      setHelpStep(s => s + 1);
                    } else {
                      setHelpReferenceOpen(false);
                      setHelpStep(0);
                    }
                  }}
                >
                  {helpStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Persistent Video Call Overlay - Now managed by MeetingContext globally */}
    </header>
  );
};

export default EditorNavbar;
