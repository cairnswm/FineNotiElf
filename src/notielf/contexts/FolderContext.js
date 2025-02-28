import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTenant } from '../../auth/hooks/useTenant';

const FolderContext = createContext();

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};

export const FolderProvider = ({ children }) => {
  const [folders, setFolders] = useState({
    id: 0,
    name: 'My Documents',
    type: 'folder',
    children: [
      {
        id: 1,
        name: 'Shopping Lists',
        type: 'folder',
        children: [
          {
            id: 11,
            name: 'Groceries',
            type: 'document',
            content: '<p>🥑 Avocados</p><p>🥖 Bread</p><p>🥛 Milk</p>',
            owner: 'cairnswm@gmail.com',
            sharedWith: [],
            readonly: true
          },
          {
            id: 12,
            name: 'Christmas Gifts',
            type: 'document',
            content: '<p>Gift ideas for family:</p><ul><li>Mom - Cookbook</li><li>Dad - Tool set</li></ul>',
            owner: 'yolande@cairns.co.za',
            sharedWith: ['family@example.com'],
            readonly: true
          }
        ]
      },
      {
        id: 2,
        name: 'Notes',
        type: 'folder',
        children: [
          {
            id: 21,
            name: 'Ideas',
            type: 'document',
            content: '<p>Future project ideas...</p>',
            owner: 'cairnswm@gmail.com',
            sharedWith: [],
            readonly: true
          },
          {
            id: 22,
            name: 'Meeting Notes',
            type: 'folder',
            children: []
          }
        ]
      },
      {
        id: 3,
        name: 'Shared with Me',
        type: 'folder',
        children: []
      }
    ]
  });

  const { token } = useAuth();
  const { tenant } = useTenant();

  const createFolder = useCallback(async (parentFolderId, folderName) => {
    // Generate a temporary ID for immediate UI update
    const tempId = Math.floor(Date.now());
    
    // Create a new folder object
    const newFolder = {
      id: tempId,
      name: folderName,
      type: 'folder',
      children: []
    };
    
    // Update local state first for responsive UI
    setFolders(prevFolders => {
      const addToFolder = (node) => {
        if (node.id === parentFolderId) {
          const updatedChildren = [...(node.children || []), newFolder];
          return { ...node, children: updatedChildren };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addToFolder)
          };
        }
        return node;
      };
      return addToFolder(prevFolders);
    });
    
    // Create folder on the server
    const body = {
      name: folderName,
    }
    if (parentFolderId) {
      body.parent_id = parentFolderId;
    }
    try {
      const response = await fetch('http://localhost/notielf/php/api.php/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'App_id': tenant,
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Error creating folder: ${response.statusText}`);
      }

      const result = await response.json();
      
      // API returns an array with the folder details
      if (result && Array.isArray(result) && result.length > 0) {
        const createdFolder = result[0];
        
      // Update the folder with the server-generated ID
      if (createdFolder && createdFolder.id) {
        // Update in folder structure
        setFolders(prevFolders => {
          const updateFolderId = (node) => {
            if (node.id === tempId) {
              return { 
                ...node, 
                id: createdFolder.id 
              };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map(updateFolderId)
              };
            }
            return node;
          };
          return updateFolderId(prevFolders);
        });
          
          return { success: true, id: createdFolder.id };
        }
      }
      
      return { success: true, id: tempId };
    } catch (error) {
      console.error('Failed to create folder on server:', error);
      return { success: false, error: error.message };
    }
  }, [token, tenant]);

  const updateFolder = useCallback(async (folderId, updatedFields) => {
    // Update local state first for responsive UI
    setFolders(prevFolders => {
      const updateNode = (node) => {
        if (node.id === folderId) {
          return { ...node, ...updatedFields };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => updateNode(child))
          };
        }
        return node;
      };
      return updateNode(prevFolders);
    });
    
    // Update folder on the server
    try {
      const response = await fetch(`http://localhost/notielf/php/api.php/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'App_id': tenant,
        },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) {
        throw new Error(`Error updating folder: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update folder:', error);
      return { success: false, error: error.message };
    }
  }, [token, tenant]);

  const updateFolderStructure = useCallback((newFolderStructure) => {
    setFolders(newFolderStructure);
  }, []);

  const fetchFolders = useCallback(async (currentUser) => {
    try {
      const response = await fetch(`http://localhost/notielf/php/userdocs.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'App_id': tenant,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the flat array into a nested structure
      const transformData = (items) => {
        // Create a map of all items by id for quick lookup
        const itemMap = {};
        items.forEach(item => {
          // Convert document type to lowercase to match existing format
          if (item.type === 'Document') {
            item.type = 'document';
          }
          
          // Initialize children array if not present
          if (!item.children) {
            item.children = [];
          }
          
          itemMap[item.id] = item;
        });
        
        // Find the root items (folders with no parent)
        const rootItems = items.filter(item => item.parent_id === 0);

        console.log("rootItems", rootItems);
        
        // Process each item to add it to its parent's children array
        items.forEach(item => {
          if (item.parent_id !== 0 && itemMap[item.parent_id]) {
            // Add this item to its parent's children
            itemMap[item.parent_id].children.push(item);
          }
        });
        
        // Format document objects in children to match expected structure
        const processDocuments = (node) => {
          if (node.children && node.children.length > 0) {
            node.children = node.children.map(child => {
              if (child.type === 'document') {
                return {
                  ...child,
                  owner: currentUser?.email || '',
                  sharedWith: [],
                  readonly: child.readonly === 0 ? false : true
                };
              }
              return processDocuments(child);
            });
          }
          return node;
        };
        
        // Create a virtual root folder containing all root folders
        const virtualRoot = {
          id: 0,
          name: 'My Documents',
          type: 'folder',
          children: rootItems.map(processDocuments)
        };
        
        return virtualRoot;
      };
      
      const transformedData = transformData(data);
      setFolders(transformedData);
      return transformedData;
    } catch (err) {
      console.error('Failed to fetch folders:', err);
      throw err;
    }
  }, [token, tenant]);

  const moveFolder = useCallback(async (folderId, targetFolderId) => {
    // Update local state first for responsive UI
    updateFolderStructure(prevFolders => {
      let movedNode = null;

      const removeNode = (node) => {
        if (node.id === folderId) {
          movedNode = node; // Store the node to be moved
          return null; // Remove the node from its current position
        }
        if (node.children) {
          return {
            ...node,
            children: node.children
              .map(removeNode)
              .filter(child => child !== null) // Filter out the removed node
          };
        }
        return node;
      };

      const addToTarget = (node) => {
        if (node.id === targetFolderId) {
          const updatedChildren = [...(node.children || []), movedNode]; // Add to target folder
          return { ...node, children: updatedChildren };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addToTarget)
          };
        }
        return node;
      };

      const updatedFolders = removeNode(prevFolders);
      return addToTarget(updatedFolders);
    });
    
    // Update folder on the server
    try {
      const response = await fetch(`http://localhost/notielf/php/api.php/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'App_id': tenant,
        },
        body: JSON.stringify({
          parent_id: targetFolderId
        })
      });

      if (!response.ok) {
        throw new Error(`Error updating folder parent: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update folder parent:', error);
      return { success: false, error: error.message };
    }
  }, [token, tenant, updateFolderStructure]);

  const value = {
    folders,
    updateFolderStructure,
    fetchFolders,
    createFolder,
    updateFolder,
    moveFolder
  };

  return (
    <FolderContext.Provider value={value}>
      {children}
    </FolderContext.Provider>
  );
};

export default FolderProvider;
