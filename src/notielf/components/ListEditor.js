import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { PlusCircle, GearFill } from 'react-bootstrap-icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ListItem from './list/listitem';
import AddItemModal from './list/additemmodal';
import EditItemModal from './list/edititemmodal';
import SettingsModal from './list/settingsmodal';
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

  // Move item - for drag and drop reordering
  const moveItem = (dragIndex, hoverIndex) => {
    if (document.readonly) return;
    
    const dragItem = listData.list[dragIndex];
    const updatedList = [...listData.list];
    
    // Remove the dragged item
    updatedList.splice(dragIndex, 1);
    // Insert it at the new position
    updatedList.splice(hoverIndex, 0, dragItem);
    
    const updatedData = { ...listData, list: updatedList };
    setListData(updatedData);
    saveChanges(updatedData);
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

      {/* List of items with drag and drop */}
      <DndProvider backend={HTML5Backend}>
        <ListGroup>
          {listData.list.map((item, index) => (
            <ListItem
              key={item.id}
              index={index}
              item={item}
              listSettings={listData.settings}
              document={document}
              toggleChecked={toggleChecked}
              moveToTop={moveToTop}
              moveToBottom={moveToBottom}
              startEditing={startEditing}
              deleteItem={deleteItem}
              moveItem={moveItem}
            />
          ))}
        </ListGroup>
      </DndProvider>
      
      {listData.list.length === 0 && (
        <div className="text-center text-muted my-4">
          <p>No items in this list. Add your first item using the button above.</p>
        </div>
      )}

      {/* Modals */}
      <AddItemModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemDescription={newItemDescription}
        setNewItemDescription={setNewItemDescription}
        newItemDueDate={newItemDueDate}
        setNewItemDueDate={setNewItemDueDate}
        addItem={addItem}
        hasDueDates={listData.settings.hasDueDates}
      />

      <EditItemModal
        show={!!editingItemId}
        onHide={cancelEditing}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemDescription={newItemDescription}
        setNewItemDescription={setNewItemDescription}
        newItemDueDate={newItemDueDate}
        setNewItemDueDate={setNewItemDueDate}
        saveEditedItem={saveEditedItem}
        hasDueDates={listData.settings.hasDueDates}
      />

      <SettingsModal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
        saveSettings={saveSettings}
        listSettings={listData.settings}
      />
    </div>
  );
}
