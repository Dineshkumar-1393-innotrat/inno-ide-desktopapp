import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for a resizable sidebar.
 * @param {number} defaultWidth - Default width of the sidebar
 * @param {number} minWidth - Minimum width constraint
 * @param {number} maxWidth - Maximum width constraint
 */
export const useResizableSidebar = (defaultWidth = 240, minWidth = 160, maxWidth = 480) => {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);

  const startResizing = (event) => {
    setIsResizing(true);
    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    if (event.preventDefault) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event) => {
      const delta = event.clientX - resizeStartXRef.current;
      const nextWidth = resizeStartWidthRef.current + delta;
      const clampedWidth = Math.min(Math.max(nextWidth, minWidth), maxWidth);
      setSidebarWidth(clampedWidth);
    };

    const stopResizing = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth]);

  return { sidebarWidth, isResizing, startResizing };
};
