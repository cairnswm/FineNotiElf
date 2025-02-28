import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTenant } from '../../auth/hooks/useTenant';
import { combineUrlAndPath } from '../../auth/utils/combineUrlAndPath';
import { useFolders } from './FolderContext';

const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  console.log("DocumentProvider.js");
  const [activeDocument, setActiveDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user: currentUser, token } = useAuth();
  const { tenant } = useTenant();
  const { 
    folders, 
    updateFolderStructure,
    fetchFolders
  } = useFolders();

  const updateDocumentInFolder = useCallback((id, updatedFields) => {
    updateFolderStructure(prevFolders => {
      const updateNode = (node) => {
        if (node.id === id) {
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
  }, [updateFolderStructure]);

  const moveDocument = useCallback((id, targetFolderId) => {
    updateFolderStructure(prevFolders => {
      let movedNode = null;

      const removeNode = (node) => {
        if (node.id === id) {
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

      const findParentFolder = (node, childId) => {
        if (node.children) {
          for (const child of node.children) {
            if (child.id === childId) {
              return node; // Return the parent node
            }
            const parent = findParentFolder(child, childId);
            if (parent) return parent; // Return the found parent
          }
        }
        return null; // Not found
      };

      const addToTarget = (node) => {
        if (node.id === targetFolderId) {
          const updatedChildren = [...(node.children || []), movedNode]; // Add to target folder
          // Sort children: documents first, then folders
          updatedChildren.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'document') return 1;
            if (a.type === 'document' && b.type === 'folder') return -1;
            return a.name.localeCompare(b.name);
          });
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
      const targetNode = updatedFolders.children.find(child => child.id === targetFolderId);
      if (targetNode && targetNode.type === 'document') {
        const parentFolder = findParentFolder(updatedFolders, targetFolderId);
        if (parentFolder) {
          return addToTarget(parentFolder);
        }
      }
      return addToTarget(updatedFolders);
    });

    // Update DocumentOwnership record on the server
    const updateDocumentOwnership = async () => {
      try {
        // First, find the DocumentOwnership record for this document
        const response = await fetch(`http://localhost/notielf/php/api.php/documents/${id}/ownership`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App_id': tenant,
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching document ownership: ${response.statusText}`);
        }

        const ownershipData = await response.json();
        
        if (ownershipData && ownershipData.length > 0) {
          const ownershipId = ownershipData[0].id;
          
          // Update the folder_id in the DocumentOwnership record
          const updateResponse = await fetch(`http://localhost/notielf/php/api.php/documentownership/${ownershipId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'App_id': tenant,
            },
            body: JSON.stringify({
              folder_id: targetFolderId
            })
          });

          if (!updateResponse.ok) {
            throw new Error(`Error updating document ownership: ${updateResponse.statusText}`);
          }
        }
      } catch (error) {
        console.error('Failed to update document ownership:', error);
      }
    };

    updateDocumentOwnership();
  }, [token, tenant, updateFolderStructure]);

  const saveDocument = useCallback(async (id, data) => {
    try {
      const response = await fetch(`http://localhost/notielf/php/api.php/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'App_id': tenant,
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error updating document: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      setError(error.message);
      return false;
    }
  }, [token, tenant]);

  const updateDocumentContent = useCallback((id, newContent) => {
    // Update in folder structure
    updateDocumentInFolder(id, { content: newContent });
    
    // Update active document if it's the one being edited
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, content: newContent };
      }
      return prev;
    });

    // Save to server
    saveDocument(id, { content: newContent });
  }, [updateDocumentInFolder, saveDocument]);

  const updateDocumentName = useCallback((id, newName) => {
    // Update in folder structure
    updateDocumentInFolder(id, { name: newName });
    
    // Update active document if it's the one being edited
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, name: newName };
      }
      return prev;
    });

    // Save to server
    saveDocument(id, { title: newName });
  }, [updateDocumentInFolder, saveDocument]);

  const updateSharedWith = useCallback((id, sharedWith) => {
    // Update in folder structure
    updateDocumentInFolder(id, { sharedWith });
    
    // Update active document if it's the one being edited
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, sharedWith };
      }
      return prev;
    });
  }, [updateDocumentInFolder]);

  const setReadOnly = useCallback((id, readonly) => {
    // Update in folder structure
    updateDocumentInFolder(id, { readonly });
    
    // Update active document if it's the one being edited
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, readonly };
      }
      return prev;
    });

    // Save to server
    saveDocument(id, { readonly: readonly ? 1 : 0 });
  }, [updateDocumentInFolder, saveDocument]);

  const addDocument = useCallback((folderId, newDocument) => {
    // Generate a temporary ID for immediate UI update
    const tempId = Math.floor(Date.now());
    
    // Create a new document with the temporary ID
    const tempDocument = { ...newDocument, id: tempId };
    
    // Update local state first for responsive UI
    updateFolderStructure(prevFolders => {
      const addToFolder = (node) => {
        if (node.id === folderId) {
          const updatedChildren = [...(node.children || []), tempDocument];
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
    
    // Set the new document as active
    setActiveDocument(tempDocument);
    
    // Create document on the server
    const createDocumentOnServer = async () => {
      try {
        // Step 1: Create the document
        const response = await fetch('http://localhost/notielf/php/api.php/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App_id': tenant,
          },
          body: JSON.stringify({
            title: newDocument.name,
            type: newDocument.type,
            content: newDocument.content || '',
            readonly: newDocument.readonly || false,
            editing_id: null
          })
        });

        if (!response.ok) {
          throw new Error(`Error creating document: ${response.statusText}`);
        }

        const result = await response.json();
        
        // API returns an array with the document details
        if (result && Array.isArray(result) && result.length > 0) {
          const createdDoc = result[0];
          
          // Update the document with the server-generated ID
          if (createdDoc && createdDoc.id) {
            // Step 2: Create the DocumentOwnership record to link document to folder
            const ownershipResponse = await fetch('http://localhost/notielf/php/api.php/documentownership', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'App_id': tenant,
              },
              body: JSON.stringify({
                document_id: createdDoc.id,
                folder_id: folderId,
                readonly: newDocument.readonly || false
              })
            });
            
            if (!ownershipResponse.ok) {
              console.error('Failed to create document ownership record:', ownershipResponse.statusText);
            }
            
            // Update the document with server data
            const serverDocument = { 
              id: createdDoc.id,
              name: createdDoc.title,
              type: createdDoc.type.toLowerCase(),
              content: createdDoc.content,
              readonly: createdDoc.readonly === 0 ? false : true
            };
            
            // Update in folder structure
            updateDocumentInFolder(tempDocument.id, serverDocument);
            
            // Update active document if it's the one we just created
            setActiveDocument(prev => {
              if (prev && prev.id === tempDocument.id) {
                return { ...prev, ...serverDocument };
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Failed to create document on server:', error);
        setError(error.message);
      }
    };

    createDocumentOnServer();
  }, [token, tenant, updateFolderStructure, updateDocumentInFolder]);

  const addDocumentBefore = useCallback((targetId, newDocument) => {
    // Generate a temporary ID for immediate UI update
    const tempId = Math.floor(Date.now());
    
    // Find the parent folder of the target
    let parentFolderId = null;
    
    const findParentFolder = (node, targetId) => {
      if (node.children) {
        for (const child of node.children) {
          if (child.id === targetId) {
            parentFolderId = node.id;
            return true;
          }
          if (findParentFolder(child, targetId)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Create a new document with the temporary ID
    const tempDocument = { ...newDocument, id: tempId, parentFolderId };
    
    // Update local state first for responsive UI
    updateFolderStructure(prevFolders => {
      // Find the parent folder ID
      findParentFolder(prevFolders, targetId);
      
      const addBefore = (node) => {
        if (node.children) {
          const targetIndex = node.children.findIndex(child => child.id === targetId);
          if (targetIndex !== -1) {
            const updatedChildren = [
              ...node.children.slice(0, targetIndex),
              tempDocument,
              ...node.children.slice(targetIndex)
            ];
            return { ...node, children: updatedChildren };
          }
          return {
            ...node,
            children: node.children.map(addBefore)
          };
        }
        return node;
      };
      return addBefore(prevFolders);
    });
    
    // Set the new document as active
    setActiveDocument(tempDocument);
    
    // Create document on the server
    const createDocumentOnServer = async () => {
      try {
        // Step 1: Create the document
        const response = await fetch('http://localhost/notielf/php/api.php/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App_id': tenant,
          },
          body: JSON.stringify({
            title: newDocument.name,
            type: newDocument.type,
            content: newDocument.content || '',
            readonly: newDocument.readonly || false,
            editing_id: null
          })
        });

        if (!response.ok) {
          throw new Error(`Error creating document: ${response.statusText}`);
        }

        const result = await response.json();
        
        // API returns an array with the document details
        if (result && Array.isArray(result) && result.length > 0) {
          const createdDoc = result[0];
          
          // Update the document with the server-generated ID
          if (createdDoc && createdDoc.id) {
            // Step 2: Create the DocumentOwnership record to link document to folder
            const ownershipResponse = await fetch('http://localhost/notielf/php/api.php/documentownership', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'App_id': tenant,
              },
              body: JSON.stringify({
                document_id: createdDoc.id,
                folder_id: tempDocument.parentFolderId,
                readonly: newDocument.readonly || false
              })
            });
            
            if (!ownershipResponse.ok) {
              console.error('Failed to create document ownership record:', ownershipResponse.statusText);
            }
            
            // Update the document with server data
            const serverDocument = { 
              id: createdDoc.id,
              name: createdDoc.title,
              type: createdDoc.type.toLowerCase(),
              content: createdDoc.content,
              readonly: createdDoc.readonly === 0 ? false : true
            };
            
            // Update in folder structure
            updateDocumentInFolder(tempDocument.id, serverDocument);
            
            // Update active document if it's the one we just created
            setActiveDocument(prev => {
              if (prev && prev.id === tempDocument.id) {
                return { ...prev, ...serverDocument };
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Failed to create document on server:', error);
        setError(error.message);
      }
    };

    createDocumentOnServer();
  }, [token, tenant, updateFolderStructure, updateDocumentInFolder]);

  const isOwner = activeDocument?.owner === currentUser?.email;

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchFolders(currentUser);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && tenant) {
      loadDocuments();
    }
  }, [currentUser, tenant, fetchFolders]);

  const value = {
    documents: folders,
    activeDocument,
    setActiveDocument,
    loading,
    error,
    updateDocumentContent,
    updateDocumentName,
    updateSharedWith,
    setReadOnly,
    moveDocument,
    addDocument,
    addDocumentBefore,
    updateDocumentInFolder,
    isOwner
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentProvider;
