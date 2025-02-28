import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { PlusCircle, Trash, Calendar, Check2Circle } from 'react-bootstrap-icons';
import { useDocuments } from '../contexts/DocumentContext';
import './ListEditor.css';

export default function ListEditor({ document }) {
  const { updateDocumentContent } = useDocuments();
  const [listData, setListData] = useState({ settings: { id: 0, hasDueDates: true, canDelete: true }, list: [] });
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);

  // Parse the document content when it changes
  useEffect(() => {
    if (document && document.content) {
      try {
        // If content is a string (JSON), parse it
        const content = typeof document.content === 'string' 
          ? JSON.parse(document.content) 
          : document.content;
        
        // Ensure the content has the expected structure
        const validContent = {
          settings: content.settings || { id: Date.now(), hasDueDates: true, canDelete: true },
          list: Array.isArray(content.list) ? content.list : []
        };
        
        setListData(validContent);
      } catch (error) {
        // If parsing fails, initialize with empty data
        console.error('Error parsing list data:', error);
        setListData({ 
          settings: { id: Date.now(), hasDueDates: true, canDelete: true }, 
          list: [] 
        });
      }
    }
  }, [document]);

  // Save changes to the document
  const saveChanges = (updatedData) => {
    const newContent = JSON.stringify(updatedData);
    updateDocumentContent(document.id, newContent);
  };

  useEffect(() => {
    console.log("List Data: ", listData);
  }, [listData]);

  // Add a new item to the list
  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName,
      description: newItemDescription,
      done: false,
      checked: false,
      due: newItemDueDate || null
    };

    const updatedData = {
      ...listData,
      list: [...listData.list, newItem]
    };

    setListData(updatedData);
    saveChanges(updatedData);
    
    // Reset form fields
    setNewItemName('');
    setNewItemDescription('');
    setNewItemDueDate('');
  };

  // Toggle the checked status of an item
  const toggleChecked = (id) => {
    const updatedList = listData.list.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );

    const updatedData = { ...listData, list: updatedList };
    setListData(updatedData);
    saveChanges(updatedData);
  };

  // Toggle the done status of an item
  const toggleDone = (id) => {
    const updatedList = listData.list.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    );

    const updatedData = { ...listData, list: updatedList };
    setListData(updatedData);
    saveChanges(updatedData);
  };

  // Delete an item from the list
  const deleteItem = (id) => {
    if (!listData.settings.canDelete) return;
    
    const updatedList = listData.list.filter(item => item.id !== id);
    const updatedData = { ...listData, list: updatedList };
    
    setListData(updatedData);
    saveChanges(updatedData);
  };

  // Start editing an item
  const startEditing = (item) => {
    setEditingItemId(item.id);
    setNewItemName(item.name);
    setNewItemDescription(item.description || '');
    setNewItemDueDate(item.due || '');
  };

  // Save edited item
  const saveEditedItem = () => {
    if (!newItemName.trim() || !editingItemId) return;

    const updatedList = listData.list.map(item => 
      item.id === editingItemId 
        ? { 
            ...item, 
            name: newItemName, 
            description: newItemDescription,
            due: newItemDueDate || null
          } 
        : item
    );

    const updatedData = { ...listData, list: updatedList };
    setListData(updatedData);
    saveChanges(updatedData);
    
    // Reset form and editing state
    setEditingItemId(null);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemDueDate('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItemId(null);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemDueDate('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="list-editor">
      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Item Name</Form.Label>
          <Form.Control
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
            disabled={document.readonly}
          />
        </Form.Group>
        
        <Form.Group className="mb-2">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            placeholder="Enter description (optional)"
            disabled={document.readonly}
          />
        </Form.Group>
        
        {listData.settings.hasDueDates && (
          <Form.Group className="mb-2">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={newItemDueDate}
              onChange={(e) => setNewItemDueDate(e.target.value)}
              disabled={document.readonly}
            />
          </Form.Group>
        )}
        
        <div className="d-flex justify-content-end">
          {editingItemId ? (
            <>
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={cancelEditing}
                disabled={document.readonly}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={saveEditedItem}
                disabled={document.readonly || !newItemName.trim()}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={addItem}
              disabled={document.readonly || !newItemName.trim()}
            >
              <PlusCircle className="me-1" /> Add Item
            </Button>
          )}
        </div>
      </Form>

      <ListGroup>
        {listData.list.map(item => (
          <ListGroup.Item 
            key={item.id}
            className={`d-flex justify-content-between align-items-start ${item.done ? 'text-muted' : ''}`}
            variant={item.checked ? 'success' : undefined}
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold" style={item.done ? { textDecoration: 'line-through' } : {}}>
                {item.name}
              </div>
              {item.description && <div>{item.description}</div>}
              {item.due && (
                <div className="mt-1">
                  <Badge bg={new Date(item.due) < new Date() && !item.done ? 'danger' : 'info'}>
                    <Calendar className="me-1" /> {formatDate(item.due)}
                  </Badge>
                </div>
              )}
            </div>
            <div className="d-flex">
              <Button 
                variant="outline-success" 
                size="sm" 
                className="me-1"
                onClick={() => toggleChecked(item.id)}
                disabled={document.readonly}
                title={item.checked ? "Uncheck" : "Check"}
              >
                <Check2Circle />
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                onClick={() => toggleDone(item.id)}
                disabled={document.readonly}
                title={item.done ? "Mark as not done" : "Mark as done"}
              >
                {item.done ? "Undo" : "Done"}
              </Button>
              
              {!document.readonly && (
                <>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-1"
                    onClick={() => startEditing(item)}
                    disabled={document.readonly}
                  >
                    Edit
                  </Button>
                  
                  {listData.settings.canDelete && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      disabled={document.readonly}
                    >
                      <Trash />
                    </Button>
                  )}
                </>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      
      {listData.list.length === 0 && (
        <div className="text-center text-muted my-4">
          <p>No items in this list. Add your first item above.</p>
        </div>
      )}
    </div>
  );
}
