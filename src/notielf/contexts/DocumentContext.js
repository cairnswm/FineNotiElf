import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTenant } from '../hooks/useTenant';

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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  const addDocument = useCallback((folderId, newDocument) => {
    setDocuments(prevDocuments => {
      const addToFolder = (node) => {
        if (node.id === folderId) {
          const updatedChildren = [...(node.children || []), { ...newDocument, id: Math.floor(Date.now()) }];
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
      const updatedDocuments = addToFolder(prevDocuments);
      setActiveDocument({ ...newDocument, id: Math.floor(Date.now()) }); // Set the new document as active
      return updatedDocuments;
    });
  }, []);

  const addDocumentBefore = useCallback((targetFolderId, newDocument) => {
    setDocuments(prevDocuments => {
      const addBefore = (node) => {
        if (node.children) {
          const targetIndex = node.children.findIndex(child => child.id === targetFolderId);
          if (targetIndex !== -1) {
            const updatedChildren = [
              ...node.children.slice(0, targetIndex),
              { ...newDocument, id: Math.floor(Date.now()) },
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
  }, []);

	const isOwner = activeDocument?.owner === currentUser.email;

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/documents`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'app_id': tenant,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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