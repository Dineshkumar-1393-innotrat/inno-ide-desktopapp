import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  UploadCloud, 
  Globe, 
  Code, 
  Move, 
  Edit3, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';
import './PublishCommunityModal.css';

const INCLUDES_OPTIONS = [
  { id: 'code', label: 'Code', icon: Code },
  { id: 'motion', label: 'Motion', icon: Move },
  { id: 'draw', label: 'Draw', icon: Edit3 },
  { id: 'shader_effects', label: 'Shader Effects', icon: Sparkles },
  { id: 'shader_fills', label: 'Shader Fills', icon: Layers }
];

const CATEGORIES = [
  'UI/UX Design',
  'Components & Systems',
  'Diagrams & Flowcharts',
  'Shader Effects',
  'Motion & Animation',
  'Embedded & Code',
  'Other Templates'
];

const PublishCommunityModal = ({
  open,
  onClose,
  projectName = 'INOVIEW, INNOMART, S...',
  authorName = 'Nandhini',
  onPublished
}) => {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [name, setName] = useState(projectName);
  const [description, setDescription] = useState('');
  const [includes, setIncludes] = useState(['code', 'motion']);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  // Step 2 State
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [includePrototypes, setIncludePrototypes] = useState(true);
  const fileInputRef = useRef(null);

  // Step 3 State
  const [authorType, setAuthorType] = useState('individual'); // 'individual' | 'team'
  const [handle, setHandle] = useState('');
  const [contributors, setContributors] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [supportContact, setSupportContact] = useState('');

  if (!open) return null;

  const toggleInclude = (id) => {
    if (includes.includes(id)) {
      setIncludes(includes.filter((i) => i !== id));
    } else {
      setIncludes([...includes, id]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePublish = () => {
    setStep(4); // Success screen
    if (onPublished) {
      onPublished({
        name,
        description,
        includes,
        category,
        tags,
        thumbnailUrl,
        includePrototypes,
        authorType,
        handle,
        contributors,
        allowComments,
        supportContact
      });
    }
  };

  return createPortal(
    <div className="pcm-backdrop" onClick={(e) => e.target.classList.contains('pcm-backdrop') && onClose()}>
      <div className="pcm-modal">
        {/* Header */}
        <header className="pcm-header">
          <h2 className="pcm-header-title">Publish your work to Community</h2>
          <button type="button" className="pcm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </header>

        {step === 4 ? (
          /* Success Screen */
          <div className="pcm-success-container">
            <div className="pcm-success-icon">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="pcm-success-title">Project Published!</h3>
            <p className="pcm-success-desc">
              Your project <strong>"{name}"</strong> has been successfully published to the Community Marketplace.
            </p>
            <div className="pcm-footer" style={{ borderTop: 'none', padding: 0, marginTop: 16 }}>
              <button type="button" className="pcm-btn pcm-btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Wizard Body */
          <div className="pcm-body">
            {/* Sidebar Left */}
            <aside className="pcm-sidebar">
              <div className="pcm-stepper">
                <div 
                  className={`pcm-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}
                  onClick={() => setStep(1)}
                >
                  <div className="pcm-step-number">{step > 1 ? '✓' : '1'}</div>
                  <span className="pcm-step-label">Describe your resource</span>
                </div>

                <div 
                  className={`pcm-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}
                  onClick={() => step > 1 && setStep(2)}
                >
                  <div className="pcm-step-number">{step > 2 ? '✓' : '2'}</div>
                  <span className="pcm-step-label">Set a thumbnail</span>
                </div>

                <div 
                  className={`pcm-step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}
                  onClick={() => step > 2 && setStep(3)}
                >
                  <div className="pcm-step-number">3</div>
                  <span className="pcm-step-label">Add the final details</span>
                </div>
              </div>

              {/* Resource Preview Box at Bottom Left */}
              <div className="pcm-preview-container">
                <div className="pcm-preview-heading">Resource Preview</div>
                <div className="pcm-preview-card">
                  <div className="pcm-preview-thumb-box">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="Thumbnail preview" />
                    ) : (
                      <Globe className="pcm-preview-thumb-icon" size={32} />
                    )}
                  </div>
                  <h4 className="pcm-preview-title" title={name || 'Project Name'}>
                    {name || 'Project Name'}
                  </h4>
                  <p className="pcm-preview-author">By {authorName}</p>
                </div>
              </div>
            </aside>

            {/* Content Area Right */}
            <main className="pcm-content">
              {step === 1 && (
                /* Step 1: Describe your resource */
                <div className="pcm-step-pane">
                  <div className="pcm-form-group">
                    <div className="pcm-form-label-row">
                      <label className="pcm-label">Name *</label>
                      <span className="pcm-char-count">{name.length}/100</span>
                    </div>
                    <input
                      type="text"
                      className="pcm-input"
                      placeholder="Project name"
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Description *</label>
                    <textarea
                      className="pcm-input pcm-textarea"
                      placeholder="What can people find or learn from this file? Get specific, so the community knows what to expect."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Includes</label>
                    <div className="pcm-includes-container">
                      {INCLUDES_OPTIONS.map((opt) => {
                        const IconComp = opt.icon;
                        const isSelected = includes.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`pcm-chip ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleInclude(opt.id)}
                          >
                            <IconComp className="pcm-chip-icon" />
                            <span>{opt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Category *</label>
                    <select
                      className="pcm-input pcm-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Tags*</label>
                    <input
                      type="text"
                      className="pcm-input"
                      placeholder="Select a Tags or type (comma separated)..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <footer className="pcm-footer">
                    <button type="button" className="pcm-btn pcm-btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="pcm-btn pcm-btn-primary"
                      disabled={!name.trim()}
                      onClick={() => setStep(2)}
                    >
                      Next
                    </button>
                  </footer>
                </div>
              )}

              {step === 2 && (
                /* Step 2: Set a thumbnail */
                <div className="pcm-step-pane">
                  <div className="pcm-form-group">
                    <label className="pcm-label">Set a thumbnail *</label>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                      Recommended size: 1920 × 1080px
                    </p>

                    <div
                      className="pcm-upload-area"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />

                      {thumbnailUrl ? (
                        <>
                          <img src={thumbnailUrl} alt="Thumbnail" className="pcm-uploaded-preview" />
                          <button
                            type="button"
                            className="pcm-replace-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                          >
                            Replace image
                          </button>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="pcm-upload-icon" />
                          <p className="pcm-upload-text">
                            <span>drag & drop or browse</span>
                          </p>
                          <p className="pcm-upload-subtext">Recommended size: 1920 × 1080px</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pcm-switch-row">
                    <div className="pcm-switch-info">
                      <span className="pcm-switch-label">Prototype preview</span>
                      <span className="pcm-switch-subtext">Include prototypes in the thumbnail</span>
                    </div>
                    <label className="pcm-switch">
                      <input
                        type="checkbox"
                        checked={includePrototypes}
                        onChange={(e) => setIncludePrototypes(e.target.checked)}
                      />
                      <span className="pcm-slider"></span>
                    </label>
                  </div>

                  <footer className="pcm-footer">
                    <button type="button" className="pcm-btn pcm-btn-secondary" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="button" className="pcm-btn pcm-btn-primary" onClick={() => setStep(3)}>
                      Next
                    </button>
                  </footer>
                </div>
              )}

              {step === 3 && (
                /* Step 3: Add the final details */
                <div className="pcm-step-pane">
                  <div className="pcm-form-group">
                    <label className="pcm-label">Author (Share as)</label>
                    <div className="pcm-author-cards">
                      <div
                        className={`pcm-author-card ${authorType === 'individual' ? 'selected' : ''}`}
                        onClick={() => setAuthorType('individual')}
                      >
                        <div className="pcm-author-avatar">{authorName[0]?.toUpperCase() || 'N'}</div>
                        <div className="pcm-author-details">
                          <span className="pcm-author-name">{authorName}</span>
                          <span className="pcm-author-type">Individual creator</span>
                        </div>
                      </div>

                      <div
                        className={`pcm-author-card ${authorType === 'team' ? 'selected' : ''}`}
                        onClick={() => setAuthorType('team')}
                      >
                        <div className="pcm-author-avatar team">{authorName[0]?.toUpperCase() || 'N'}</div>
                        <div className="pcm-author-details">
                          <span className="pcm-author-name">{authorName}'s team</span>
                          <span className="pcm-author-type">Team</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Set a unique handle for your new Community profile</label>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#64748b' }}>
                      Review our Community guidelines here. Use up to 15 characters (letters, numbers, or _)
                    </p>
                    <div className="pcm-handle-wrapper">
                      <span className="pcm-handle-prefix">figma.com/@</span>
                      <input
                        type="text"
                        className="pcm-input pcm-handle-input"
                        placeholder="handle"
                        maxLength={15}
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      />
                    </div>
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Additional contributors</label>
                    <input
                      type="text"
                      className="pcm-input"
                      placeholder="Give up to 10 creators credit by name or @username"
                      value={contributors}
                      onChange={(e) => setContributors(e.target.value)}
                    />
                  </div>

                  <div className="pcm-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      id="allowCommentsCheck"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                    />
                    <label htmlFor="allowCommentsCheck" className="pcm-label" style={{ fontWeight: 500 }}>
                      Allow comments from Community members
                    </label>
                  </div>

                  <div className="pcm-form-group">
                    <label className="pcm-label">Support contact</label>
                    <input
                      type="text"
                      className="pcm-input"
                      placeholder="Email or website where users can contact you"
                      value={supportContact}
                      onChange={(e) => setSupportContact(e.target.value)}
                    />
                  </div>

                  <footer className="pcm-footer">
                    <button type="button" className="pcm-btn pcm-btn-secondary" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button type="button" className="pcm-btn pcm-btn-primary" onClick={handlePublish}>
                      Publish
                    </button>
                  </footer>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PublishCommunityModal;
