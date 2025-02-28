import { useDocuments } from '../contexts/DocumentContext';

export function useDocumentOperations() {
  const { documents, setDocuments } = useDocuments();

  const addDocument = (document) => {
    setDocuments(prevDocuments => {
      const addToFolder = (node) => {
        if (node.type === 'folder' && node.name === 'Shared with Me') {
          return {
            ...node,
            children: [...node.children, document]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(child => addToFolder(child))
          };
        }
        return node;
      };

      // If "Shared with Me" folder doesn't exist, create it
      const hasSharedFolder = documents.children.some(
        node => node.type === 'folder' && node.name === 'Shared with Me'
      );

      if (!hasSharedFolder) {
        return {
          ...prevDocuments,
          children: [
            ...prevDocuments.children,
            {
              id: 'shared-folder',
              name: 'Shared with Me',
              type: 'folder',
              children: [document]
            }
          ]
        };
      }

      return addToFolder(prevDocuments);
    });
  };

  return { addDocument };
}
