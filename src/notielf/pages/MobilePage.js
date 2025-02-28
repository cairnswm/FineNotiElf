import React, { useState } from "react";
import FolderStructure from "../components/folder/FolderStructure";
import Editor from "../components/Editor";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

export default function MobilePage() {
  const [leftPaneVisible, setLeftPaneVisible] = useState(false); // State for folder pane visibility

  const toggleFolderPane = () => {
    setLeftPaneVisible(!leftPaneVisible);
  };

  const handleDocumentSelect = (document) => {
    console.log("Document Selected: ", document);
    // Logic for handling document selection
    setLeftPaneVisible(false);
  };

  return (
    <div className="mobile-container">
      {leftPaneVisible && (
        <button className="toggle-button" onClick={toggleFolderPane}>
          <ChevronLeft />
        </button>
      )}
      {!leftPaneVisible && (
        <button className="toggle-button" onClick={toggleFolderPane}>
          <ChevronRight />
        </button>
      )}
      {leftPaneVisible && (
        <div
          className={`folder-pane ${leftPaneVisible ? "visible" : ""}`}
          style={{ width: "100%" }}
        >
          <FolderStructure onDocumentSelect={handleDocumentSelect} />
        </div>
      )}
      {!leftPaneVisible && (
        <div className="editor-pane full-width" style={{ flexGrow: 1 }}>
          <Editor />
        </div>
      )}
    </div>
  );
}
