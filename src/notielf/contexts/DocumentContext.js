import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTenant } from '../../auth/hooks/useTenant';
import { combineUrlAndPath } from '../../auth/utils/combineUrlAndPath';

const DocumentContext = createContext();

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}

export function DocumentProvider({ children }) {
  console.log("DocumentProvider.js");
  const [documents, setDocuments] = useState({
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

  const [activeDocument, setActiveDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const { user: currentUser, token } = useAuth();
  const { tenant } = useTenant();

  const updateDocumentContent = useCallback((id, newContent) => {
    setDocuments(prevDocuments => {
      const updateContent = (node) => {
        if (node.type === 'document' && node.id === id) {
          return { ...node, content: newContent };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => updateContent(child))
          };
        }
        return node;
      };
      return updateContent(prevDocuments);
    });
    
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, content: newContent };
      }
      return prev;
    });

    // Save document content to the server
    const saveDocumentContent = async () => {
      try {
        const response = await fetch(`http://localhost/notielf/php/api.php/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App_id': tenant,
          },
          body: JSON.stringify({
            content: newContent
          })
        });

        if (!response.ok) {
          throw new Error(`Error updating document: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to update document content:', error);
        setError(error.message);
      }
    };

    saveDocumentContent();
  }, [token, tenant]);

  const updateDocumentName = useCallback((id, newName) => {
    setDocuments(prevDocuments => {
      const updateName = (node) => {
        if (node.id === id) {
          return { ...node, name: newName };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => updateName(child))
          };
        }
        return node;
      };
      return updateName(prevDocuments);
    });
    
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, name: newName };
      }
      return prev;
    });

    // Save document title to the server
    const saveDocumentTitle = async () => {
      try {
        const response = await fetch(`http://localhost/notielf/php/api.php/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App_id': tenant,
          },
          body: JSON.stringify({
            title: newName
          })
        });

        if (!response.ok) {
          throw new Error(`Error updating document title: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to update document title:', error);
        setError(error.message);
      }
    };

    saveDocumentTitle();
  }, [token, tenant]);

  const updateSharedWith = useCallback((id, sharedWith) => {
    setDocuments(prevDocuments => {
      const updateSharing = (node) => {
        if (node.type === 'document' && node.id === id) {
          return { ...node, sharedWith };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => updateSharing(child))
          };
        }
        return node;
      };
      return updateSharing(prevDocuments);
    });
    
    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, sharedWith };
      }
      return prev;
    });
  }, []);

  const setReadOnly = useCallback((id, readonly) => {
    setDocuments(prevDocuments => {
      const updateReadonly = (node) => {
        if (node.type === 'document' && node.id === id) {
          return { ...node, readonly };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => updateReadonly(child))
          };
        }
        return { ...node, readonly: true};
      };
      return updateReadonly(prevDocuments);
    });

    setActiveDocument(prev => {
      if (prev && prev.id === id) {
        return { ...prev, readonly };
      }
      return prev;
    });

    // Save readonly status to the server
    const saveReadOnlyStatus = async () => {
      try {
        const response = await fetch(`http://localhost/notielf/php/api.php/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App_id': tenant,
          },
          body: JSON.stringify({
            readonly: readonly ? 1 : 0
          })
        });

        if (!response.ok) {
          throw new Error(`Error updating document readonly status: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to update document readonly status:', error);
        setError(error.message);
      }
    };

    saveReadOnlyStatus();
  }, [token, tenant]);

  const moveDocument = useCallback((id, targetFolderId) => {
    setDocuments(prevDocuments => {
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

      const updatedDocuments = removeNode(prevDocuments);
      const targetNode = updatedDocuments.children.find(child => child.id === targetFolderId);
      if (targetNode && targetNode.type === 'document') {
        const parentFolder = findParentFolder(updatedDocuments, targetFolderId);
        if (parentFolder) {
          return addToTarget(parentFolder);
        }
      }
      return addToTarget(updatedDocuments);
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
        setError(error.message);
      }
    };

    updateDocumentOwnership();
  }, [token, tenant]);

  const addDocument = useCallback((folderId, newDocument) => {
    // Generate a temporary ID for immediate UI update
    const tempId = Math.floor(Date.now());
    
    // Update local state first for responsive UI
    setDocuments(prevDocuments => {
      const addToFolder = (node) => {
        if (node.id === folderId) {
          const updatedChildren = [...(node.children || []), { ...newDocument, id: tempId }];
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
      return addToFolder(prevDocuments);
    });
    
    // Set the new document as active
    setActiveDocument({ ...newDocument, id: tempId });
    
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
            
            setDocuments(prevDocuments => {
              const updateId = (node) => {
                if (node.children) {
                  return {
                    ...node,
                    children: node.children.map(child => 
                      child.id === tempId ? { 
                        ...child, 
                        id: createdDoc.id,
                        // Update other properties from the server response
                        name: createdDoc.title,
                        type: createdDoc.type.toLowerCase(),
                        content: createdDoc.content,
                        readonly: createdDoc.readonly === 0 ? false : true
                      } : updateId(child)
                    )
                  };
                }
                return node;
              };
              return updateId(prevDocuments);
            });
            
            // Update active document if it's the one we just created
            setActiveDocument(prev => {
              if (prev && prev.id === tempId) {
                return { 
                  ...prev, 
                  id: createdDoc.id,
                  name: createdDoc.title,
                  type: createdDoc.type.toLowerCase(),
                  content: createdDoc.content,
                  readonly: createdDoc.readonly === 0 ? false : true
                };
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
  }, [token, tenant]);

  const addDocumentBefore = useCallback((targetFolderId, newDocument) => {
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
    
    // Update local state first for responsive UI
    setDocuments(prevDocuments => {
      // Find the parent folder ID
      findParentFolder(prevDocuments, targetFolderId);
      
      const addBefore = (node) => {
        if (node.children) {
          const targetIndex = node.children.findIndex(child => child.id === targetFolderId);
          if (targetIndex !== -1) {
            const updatedChildren = [
              ...node.children.slice(0, targetIndex),
              { ...newDocument, id: tempId },
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
      return addBefore(prevDocuments);
    });
    
    // Set the new document as active
    setActiveDocument({ ...newDocument, id: tempId });
    
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
                folder_id: parentFolderId,
                readonly: newDocument.readonly || false
              })
            });
            
            if (!ownershipResponse.ok) {
              console.error('Failed to create document ownership record:', ownershipResponse.statusText);
            }
            
            setDocuments(prevDocuments => {
              const updateId = (node) => {
                if (node.children) {
                  return {
                    ...node,
                    children: node.children.map(child => 
                      child.id === tempId ? { 
                        ...child, 
                        id: createdDoc.id,
                        // Update other properties from the server response
                        name: createdDoc.title,
                        type: createdDoc.type.toLowerCase(),
                        content: createdDoc.content,
                        readonly: createdDoc.readonly === 0 ? false : true
                      } : updateId(child)
                    )
                  };
                }
                return node;
              };
              return updateId(prevDocuments);
            });
            
            // Update active document if it's the one we just created
            setActiveDocument(prev => {
              if (prev && prev.id === tempId) {
                return { 
                  ...prev, 
                  id: createdDoc.id,
                  name: createdDoc.title,
                  type: createdDoc.type.toLowerCase(),
                  content: createdDoc.content,
                  readonly: createdDoc.readonly === 0 ? false : true
                };
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
  }, [token, tenant]);

	const isOwner = activeDocument?.owner === currentUser.email;

  useEffect(() => {
    const fetchDocuments = async () => {
      console.log("fetchDocuments", tenant, token);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(combineUrlAndPath(process.env.NOTIELF_API,"userdocs.php"), {
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
          
          // Find the root items (My Documents and Shared with Me)
          const rootItems = items.filter(item => item.parent_id === null);
          
          // Process each item to add it to its parent's children array
          items.forEach(item => {
            if (item.parent_id !== null && itemMap[item.parent_id]) {
              // Add this item to its parent's children
              itemMap[item.parent_id].children.push(item);
            }
          });
          
          // Find "My Documents" folder to use as the root
          const myDocuments = rootItems.find(item => item.name === "My Documents");
          
          if (myDocuments) {
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
            
            return processDocuments(myDocuments);
          }
          
          return {
            id: 0,
            name: 'My Documents',
            type: 'folder',
            children: []
          };
        };
        
        setDocuments(transformData(data));
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    console.log("Getting", currentUser, tenant, token);
    if (currentUser && tenant) {
      fetchDocuments();
    }
  }, [currentUser, tenant, token]);

  const value = {
    documents,
    setDocuments,
    activeDocument,
    setActiveDocument,
    updateDocumentContent,
    updateDocumentName,
    updateSharedWith,
    setReadOnly,
    moveDocument,
    addDocument,
    addDocumentBefore,
    isOwner
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export default DocumentProvider;
