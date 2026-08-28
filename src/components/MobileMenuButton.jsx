import React from 'react';
import { Menu, X } from 'lucide-react';
import './MobileMenuButton.css';

/**
 * Mobile hamburger menu button component
 * Shows/hides based on viewport size
 */
const MobileMenuButton = ({ isOpen, onClick, className = '' }) => {
    return (
        <button
            className={`mobile-menu-button ${className}`}
            onClick={onClick}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            type="button"
        >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
    );
};

export default MobileMenuButton;
