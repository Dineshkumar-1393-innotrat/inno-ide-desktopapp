import React from 'react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ selectedNode, onNodeUpdate }) => {
  const isNodeSelected = Boolean(selectedNode);
  
  const handlePropertyChange = (property, value) => {
    if (onNodeUpdate && selectedNode) {
      onNodeUpdate(selectedNode.id, property, value);
    }
  };

  const handleEditText = () => {
    if (onNodeUpdate && selectedNode) {
      onNodeUpdate(selectedNode.id, 'editing', true);
    }
  };

  return (
    <div className="properties-panel">
      <div className="properties-panel-header">
        <h3>Properties</h3>
      </div>
      <div className="properties-panel-content">
        <div className="prop-label-selected">
          Selected: {selectedNode ? selectedNode.type || 'Node' : 'None'}
        </div>

      {/* Fill Color */}
      <div className="prop-row">
        <label>Fill</label>
        <div className="prop-color-input">
          <input
            id="fill-color-input"
            type="color"
            disabled={!isNodeSelected}
            value={selectedNode?.data?.fill || '#ffffff'}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
          />
          <div 
            className={`color-preview ${!isNodeSelected ? 'disabled' : ''}`}
            style={{ backgroundColor: selectedNode?.data?.fill || '#ffffff' }}
            onClick={() => !isNodeSelected ? null : document.getElementById('fill-color-input').click()}
          />
        </div>
      </div>

      {/* Border Color */}
      <div className="prop-row">
        <label>Border</label>
        <div className="prop-color-input">
          <input
            id="border-color-input"
            type="color"
            disabled={!isNodeSelected}
            value={selectedNode?.data?.stroke || '#000000'}
            onChange={(e) => handlePropertyChange('stroke', e.target.value)}
          />
          <div 
            className={`color-preview ${!isNodeSelected ? 'disabled' : ''}`}
            style={{ backgroundColor: selectedNode?.data?.stroke || '#000000' }}
            onClick={() => !isNodeSelected ? null : document.getElementById('border-color-input').click()}
          />
        </div>
      </div>

      {/* Text Color */}
      <div className="prop-row">
        <label>Text</label>
        <div className="prop-color-input">
          <input
            id="text-color-input"
            type="color"
            disabled={!isNodeSelected}
            value={selectedNode?.data?.text || '#000000'}
            onChange={(e) => handlePropertyChange('text', e.target.value)}
          />
          <div 
            className={`color-preview ${!isNodeSelected ? 'disabled' : ''}`}
            style={{ backgroundColor: selectedNode?.data?.text || '#000000' }}
            onClick={() => !isNodeSelected ? null : document.getElementById('text-color-input').click()}
          />
        </div>
      </div>

      {/* Border Width */}
      <div className="prop-row">
        <label>Border W</label>
        <div className="prop-slider-container">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            disabled={!isNodeSelected}
            value={selectedNode?.data?.strokeWidth ?? 2}
            onChange={(e) => handlePropertyChange('strokeWidth', parseFloat(e.target.value))}
            className="prop-slider"
          />
          <span className="slider-value">{selectedNode?.data?.strokeWidth ?? 2}</span>
        </div>
      </div>

      {/* Text Size */}
      <div className="prop-row">
        <label>Text Size</label>
        <div className="prop-slider-container">
          <input
            type="range"
            min="8"
            max="48"
            step="1"
            disabled={!isNodeSelected}
            value={selectedNode?.data?.fontSize || 12}
            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
            className="prop-slider"
          />
          <span className="slider-value">{selectedNode?.data?.fontSize || 12}</span>
        </div>
      </div>

      {/* Rotate */}
      <div className="prop-row">
        <label>Rotate</label>
        <div className="prop-slider-container">
          <input
            type="range"
            min="0"
            max="359"
            step="1"
            disabled={!isNodeSelected}
            value={selectedNode?.data?.rotation || 0}
            onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
            className="prop-slider"
          />
          <span className="slider-value">{selectedNode?.data?.rotation || 0}°</span>
        </div>
      </div>

        {/* Edit Text Button */}
        <button 
          className="edit-text-btn"
          disabled={!isNodeSelected}
          onClick={handleEditText}
        >
          Edit Text
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
