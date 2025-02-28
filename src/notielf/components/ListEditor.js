import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, InputGroup, FormControl, Badge, Modal, FormCheck } from 'react-bootstrap';
import { PlusCircle, Trash, Calendar, Check2Circle, Pencil, GearFill, ArrowUp, ArrowDown } from 'react-bootstrap-icons';
import { useDocuments } from '../contexts/DocumentContext';
import './ListEditor.css';

export default function ListEditor({ document }) {
  const { updateDocumentContent } = useDocuments();
  const [listData, setListData] = useState({ settings: { id: 0, hasDueDates: true, canDelete: true }, list: [] });
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ hasDueDates: true, canDelete: true });

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

  // Initialize settings form when settings change
  useEffect(() => {
    if (listData.settings) {
      setSettingsForm({
        hasDueDates: listData.settings.hasDueDates,
        canDelete: listData.settings.canDelete
      });
    }
  }, [listData.settings]);

  // Move item to bottom
  const moveToBottom = (id) => {
    const item = listData.list.find(item => item.id === id);
    if (!item) return;
    
    // If item is checked, move to bottom of list
    // If item is unchecked, move to bottom of unchecked items
    const updatedList = listData.list.filter(item => item.id !== id);
    
    if (item.checked) {
      // Move to absolute bottom
      updatedList.push(item);
    } else {
      // Find the last unchecked item
      const lastUncheckedIndex = [...updatedList]
        .reverse()
        .findIndex(item => !item.checked);
      
      if (lastUncheckedIndex === -1) {
        // No unchecked items, add to beginning
        updatedList.unshift(item);
      } else {
        // Insert after the last unchecked item
        const insertIndex = updatedList.length - lastUncheckedIndex;
        updatedList.splice(insertIndex, 0, item);
      }
    }
    
    const updatedData = { ...listData, list: updatedList };
    setListData(updatedData);
    saveChanges(updatedData);
  };

  // Move item to top
  const moveToTop = (id) => {
    const item = listData.list.find(item => item.id === id);
    if (!item) return;
    
    const updatedList = listData.list.filter(item => item.id !== id);
    updatedList.unshift(item);
    
    const updatedData = { ...listData, list: updatedList };
    setListData(updatedData);
    saveChanges(updatedData);
  };

  // Save settings
  const saveSettings = () => {
    const updatedSettings = {
      ...listData.settings,
      hasDueDates: settingsForm.hasDueDates,
      canDelete: settingsForm.canDelete
    };
    
    const updatedData = { ...listData, settings: updatedSettings };
    setListData(updatedData);
    saveChanges(updatedData);
    setShowSettingsModal(false);
  };

  // Add a new item to the list
  const addItem = () => {
    if (!newItemName.trim()) return;

    // Use the settings ID and increment it
    const newId = listData.settings.id + 1;
    
    const newItem = {
      id: newId,
      name: newItemName,
      description: newItemDescription,
      done: false,
      checked: false,
      due: newItemDueDate || null
    };

    // Create a new settings object with the updated ID
    const updatedSettings = {
      ...listData.settings,
      id: newId
    };
    
    // Create the updated data with the new settings and list
    const updatedData = {
      settings: updatedSettings,
      list: [...listData.list, newItem]
    };

    // Update state and save changes
    setListData(updatedData);
    saveChanges(updatedData);
    
    // Reset form fields
    setNewItemName('');
    setNewItemDescription('');
    setNewItemDueDate('');
    setShowAddModal(false);
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
      {/* Header with Add and Settings buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">List Items</h5>
        <div>
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => setShowSettingsModal(true)}
            disabled={document.readonly}
            title="Settings"
          >
            <GearFill />
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            disabled={document.readonly}
          >
            <PlusCircle className="me-1" /> Add Item
          </Button>
        </div>
      </div>

      {/* List of items */}
      <ListGroup>
        {listData.list.map((item) => (
          <ListGroup.Item 
            key={item.id}
            className="d-flex align-items-center"
          >
            {/* Checkbox on the left */}
            <FormCheck 
              className="me-2"
              checked={item.checked}
              onChange={() => toggleChecked(item.id)}
              disabled={document.readonly}
            />
            
            {/* Item content */}
            <div className="ms-2 me-auto">
              <div 
                className="fw-bold" 
                style={item.checked ? { textDecoration: 'line-through' } : {}}
              >
                {item.name}
              </div>
              {item.description && (
                <div style={item.checked ? { textDecoration: 'line-through' } : {}}>
                  {item.description}
                </div>
              )}
              {item.due && listData.settings.hasDueDates && (
                <div className="mt-1">
                  <Badge bg={new Date(item.due) < new Date() && !item.checked ? 'danger' : 'info'}>
                    <Calendar className="me-1" /> {formatDate(item.due)}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="d-flex">
              {/* Up/Down arrow button */}
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="me-1"
                onClick={() => item.checked ? moveToTop(item.id) : moveToBottom(item.id)}
                disabled={document.readonly}
                title={item.checked ? "Move to top" : "Move to bottom"}
              >
                {item.checked ? <ArrowUp /> : <ArrowDown />}
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
                    <Pencil />
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
          <p>No items in this list. Add your first item using the button above.</p>
        </div>
      )}

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </Form.Group>
            
            {listData.settings.hasDueDates && (
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newItemDueDate}
                  onChange={(e) => setNewItemDueDate(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={addItem}
            disabled={!newItemName.trim()}
          >
            Add Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Item Modal */}
      <Modal show={!!editingItemId} onHide={cancelEditing}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </Form.Group>
            
            {listData.settings.hasDueDates && (
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newItemDueDate}
                  onChange={(e) => setNewItemDueDate(e.target.value)}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelEditing}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={saveEditedItem}
            disabled={!newItemName.trim()}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Settings Modal */}
      <Modal show={showSettingsModal} onHide={() => setShowSettingsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>List Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control
                type="text"
                value={listData.settings?.id || ''}
                disabled
              />
              <Form.Text className="text-muted">
                ID cannot be edited
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="hasDueDates"
                label="Enable Due Dates"
                checked={settingsForm.hasDueDates}
                onChange={(e) => setSettingsForm({...settingsForm, hasDueDates: e.target.checked})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="canDelete"
                label="Allow Item Deletion"
                checked={settingsForm.canDelete}
                onChange={(e) => setSettingsForm({...settingsForm, canDelete: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={saveSettings}
          >
            Save Settings
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
