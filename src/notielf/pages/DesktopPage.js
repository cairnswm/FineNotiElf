import React, { useState } from 'react';
import FolderStructure from '../components/folder/FolderStructure';
import Editor from '../components/Editor';

export default function DesktopPage({ leftPaneVisible, setLeftPaneVisible, handleDocumentSelect }) {
  const [leftPaneWidth, setLeftPaneWidth] = useState(500); // Initial width of the left pane

  const handleMouseDown = (e) => {
    const startX = e.clientX;

    const handleMouseMove = (e) => {
      const newWidth = leftPaneWidth + (e.clientX - startX);
      setLeftPaneWidth(newWidth > 100 ? newWidth : 100); // Minimum width of 100px
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="desktop-container" style={{ display: 'flex', height: '100vh' }}>
      <div className={`folder-pane ${leftPaneVisible ? 'visible' : ''}`} style={{ width: leftPaneWidth }}>
        <FolderStructure />
      </div>
      <div className="resizer" onMouseDown={handleMouseDown} style={{ height: '100%', cursor: 'ew-resize' }} />
      <div className="editor-pane" style={{ flexGrow: 1 }}>
        <Editor />
      </div>
    </div>
  );
}
