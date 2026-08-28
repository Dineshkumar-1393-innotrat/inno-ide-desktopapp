import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Brain } from 'lucide-react';
import RuleEngineApp from './RuleEngineApp';
import './styles/index.css';

const RuleEngineModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          height: '48px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          padding: '0 16px',
          color: '#ffffff',
          userSelect: 'none',
          shrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain size={16} color="#ffffff" />
          </div>
          <span>InnoIDE Dynamic Rule Engine</span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
          title="Close Rule Engine (Esc)"
        >
          <span>Close</span>
          <X size={18} />
        </button>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: '#ffffff' }}>
        <RuleEngineApp />
      </div>
    </div>,
    document.body
  );
};

export default RuleEngineModal;
