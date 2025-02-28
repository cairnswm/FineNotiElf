import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { Alert } from 'react-bootstrap';
import EditorHeader from './EditorHeader';
import ListEditor from './ListEditor';
import DocumentEditor from './DocumentEditor';
import './Editor.css';

export default function Editor() {
  const { activeDocument, updateDocumentContent, setReadOnly, isOwner } = useDocuments();
  const previousDocumentRef = useRef(null);
  const [documentType, setDocumentType] = useState('document');

  const requestEditing = useCallback(() => {
    if (activeDocument?.id) {
      setReadOnly(activeDocument.id, false);
    }
  }, [activeDocument?.id, setReadOnly]);

  const finishEditing = useCallback(() => {
    if (activeDocument?.id) {
      setReadOnly(activeDocument.id, true);
    }
  }, [activeDocument?.id, setReadOnly]);


  // Handle document changes and ensure previous document is set to readonly
  useEffect(() => {
    if (activeDocument?.id !== previousDocumentRef.current?.id) {
      // If there was a previous document and it was being edited, set it to readonly
      if (previousDocumentRef.current?.id && !previousDocumentRef.current?.readonly) {
        setReadOnly(previousDocumentRef.current.id, true);
      }
      
      // Update the previous document reference
      previousDocumentRef.current = activeDocument;
      
      // Set document type
      if (activeDocument?.type) {
        setDocumentType(activeDocument.type.toLowerCase());
      }
    }
  }, [activeDocument, setReadOnly]);

  if (!activeDocument) {
    return (
      <Alert variant="info">
        Select a document from the sidebar to start editing
      </Alert>
    );
  }

  const renderEditor = () => {
    console.log("Rendering Editor: ", activeDocument.type, activeDocument);
    switch (activeDocument.type) {
      case 'list': case 'List':
        return <ListEditor document={activeDocument} />;
      case 'document': case 'Document':
        console.log("Rendering as Document");
        return <DocumentEditor document={activeDocument} updateDocumentContent={updateDocumentContent} />;
      default:
        return <div>Unknown Document Type</div>
    }
  };

  return (
    <div>
      <EditorHeader
        document={activeDocument}
        isOwner={isOwner}
        onRequestEdit={requestEditing}
        onFinishEdit={finishEditing}
      />

      {renderEditor()}
    </div>
  );
}
