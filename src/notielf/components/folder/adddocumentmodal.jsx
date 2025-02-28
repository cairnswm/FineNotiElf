import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDocuments } from '../../contexts/DocumentContext';

const AddDocumentModal = ({ show, handleClose, folderId, defaultType = 'document' }) => {
  const { addDocument } = useDocuments();
  const [documentType, setDocumentType] = useState(defaultType);
  const [documentTitle, setDocumentTitle] = useState(
    defaultType === 'list' ? 'New List' : 'New Document'
  );

  // Update document type when defaultType changes or when modal is shown
  React.useEffect(() => {
    setDocumentType(defaultType);
  }, [defaultType, show]);

  // Update document title when document type changes or when modal is shown
  React.useEffect(() => {
    if (documentType === 'list') {
      setDocumentTitle('New List');
    } else {
      setDocumentTitle('New Document');
    }
  }, [documentType, show]);

  const handleAddDocument = () => {
    if (documentType === 'document') {
      addDocument(folderId, {
        id: Date.now().toString(),
        name: documentTitle,
        type: 'document',
        content: '',
        owner: 'cairnswm@gmail.com',
        sharedWith: [],
        readonly: true,
      });
    } else if (documentType === 'list') {
      const initialListContent = {
        settings: { 
          id: 1, 
          hasDueDates: true, 
          canDelete: true 
        },
        list: []
      };
      
      addDocument(folderId, {
        id: Date.now().toString(),
        name: documentTitle,
        type: 'list',
        content: JSON.stringify(initialListContent),
        owner: 'cairnswm@gmail.com',
        sharedWith: [],
        readonly: true,
      });
    }
    
    handleClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDocument();
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formDocumentTitle">
            <Form.Label>Document Title</Form.Label>
            <Form.Control 
              type="text" 
              value={documentTitle} 
              onChange={(e) => setDocumentTitle(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formDocumentType">
            <Form.Label>Document Type</Form.Label>
            <Form.Select 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="document">Document</option>
              <option value="list">List</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          size="sm" 
          variant="primary" 
          onClick={handleAddDocument}
          disabled={!documentTitle.trim()}
        >
          Add Document
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddDocumentModal;
