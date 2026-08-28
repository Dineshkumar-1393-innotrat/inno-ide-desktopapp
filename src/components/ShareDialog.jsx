import React, { useState } from 'react';
import { X, Copy, Mail, ChevronDown, Check } from 'lucide-react';
import './ShareDialog.css';

const ACCESS_LEVELS = ['Anyone with link', 'Only invited users', 'Org members'];
const PERMISSIONS = ['Can view', 'Can comment', 'Can edit', 'Maintainer'];

const ShareDialog = ({
    isOpen,
    onClose,
    shareUrl,
    onInvite,          // (emails, role) => Promise
    onUpdateSettings,  // (settings) => Promise
    initialSettings = {
        accessLevel: 'Anyone with link',
        permission: 'Can view',
        passwordRequired: false,
        password: '',
    },
}) => {
    const [settings, setSettings] = useState(initialSettings);
    const [emails, setEmails] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await onUpdateSettings?.(settings);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInvite = async () => {
        const emailList = emails
            .split(/[,\s]+/)
            .map((e) => e.trim())
            .filter(Boolean);
        if (!emailList.length) return;
        setIsInviting(true);
        try {
            await onInvite?.(emailList, settings.permission);
            setEmails('');
        } finally {
            setIsInviting(false);
        }
    };

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target.className === 'share-dialog-backdrop') {
            onClose?.();
        }
    };

    return (
        <div className="share-dialog-backdrop" onClick={handleBackdropClick}>
            <div className="share-dialog">
                <header className="share-dialog__header">
                    <h2>Share this file</h2>
                    <button
                        type="button"
                        className="share-dialog__icon-btn-close"
                        onClick={onClose}
                        aria-label="Close share dialog"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="share-dialog__body">
                    {/* Copy link */}
                    <section className="share-dialog__section">
                        <label className="share-dialog__label">Copy link</label>
                        <div className="share-dialog__copy-row">
                            <input
                                type="text"
                                className="share-dialog__copy-input"
                                value={shareUrl}
                                readOnly
                            />
                            <button
                                type="button"
                                className={`share-dialog__btn share-dialog__btn--copy ${copied ? 'share-dialog__btn--success' : ''}`}
                                onClick={handleCopy}
                            >
                                {copied ? <Check size={16} className="animate-in fade-in" /> : <Copy size={16} />}
                                <span>{copied ? 'Copied' : 'Copy link'}</span>
                            </button>
                        </div>
                    </section>

                    {/* Invite via email */}
                    <section className="share-dialog__section">
                        <label className="share-dialog__label">Invite people</label>
                        <div className="share-dialog__invite-row">
                            <Mail size={16} className="share-dialog__input-icon" />
                            <input
                                type="email"
                                className="share-dialog__input"
                                placeholder="Add emails (comma or space separated)"
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                            />
                            <button
                                type="button"
                                className="share-dialog__btn share-dialog__btn--primary"
                                onClick={handleInvite}
                                disabled={isInviting || !emails.trim()}
                            >
                                {isInviting ? (
                                    'Inviting…'
                                ) : (
                                    <>
                                        <Mail size={16} />
                                        <span>Invite</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Share settings (who has access / what can they do / password) */}
                    <section className="share-dialog__section">
                        <div className="share-dialog__field">
                            <span className="share-dialog__field-label">Who can access</span>
                            <div className="share-dialog__select-wrapper">
                                <select
                                    className="share-dialog__select"
                                    value={settings.accessLevel}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, accessLevel: e.target.value }))
                                    }
                                >
                                    {ACCESS_LEVELS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="share-dialog__select-icon" />
                            </div>
                            <p className="share-dialog__hint">
                                Anyone, even outside your organisation, can access when set to
                                “Anyone with link”.
                            </p>
                        </div>

                        <div className="share-dialog__field">
                            <span className="share-dialog__field-label">What can they do</span>
                            <div className="share-dialog__select-wrapper">
                                <select
                                    className="share-dialog__select"
                                    value={settings.permission}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, permission: e.target.value }))
                                    }
                                >
                                    {PERMISSIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="share-dialog__select-icon" />
                            </div>
                        </div>

                        <div className="share-dialog__field share-dialog__field--inline" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                            <label className="share-dialog__checkbox-label">
                                <input
                                    type="checkbox"
                                    className="share-dialog__checkbox"
                                    checked={settings.passwordRequired}
                                    onChange={(e) =>
                                        setSettings((s) => ({
                                            ...s,
                                            passwordRequired: e.target.checked,
                                        }))
                                    }
                                />
                                <span>Password required</span>
                            </label>
                            {settings.passwordRequired && (
                                <input
                                    type="password"
                                    className="share-dialog__input share-dialog__password-input"
                                    placeholder="Enter password"
                                    value={settings.password}
                                    onChange={(e) =>
                                        setSettings((s) => ({ ...s, password: e.target.value }))
                                    }
                                />
                            )}

                            <label className="share-dialog__checkbox-label" style={{ marginTop: '8px' }}>
                                <input
                                    type="checkbox"
                                    className="share-dialog__checkbox"
                                    checked={settings.publishToMarketplace || false}
                                    onChange={(e) =>
                                        setSettings((s) => ({
                                            ...s,
                                            publishToMarketplace: e.target.checked,
                                        }))
                                    }
                                />
                                <span style={{ fontWeight: 600, color: '#2563eb' }}>Publish To Marketplace</span>
                            </label>
                        </div>
                    </section>
                </div>

                <footer className="share-dialog__footer">
                    <button
                        type="button"
                        className="share-dialog__btn share-dialog__btn--secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="share-dialog__btn share-dialog__btn--primary"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving…' : 'Save settings'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ShareDialog;
