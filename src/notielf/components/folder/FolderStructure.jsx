import React, { useState } from "react";
import { ListGroup, Button, Badge } from "react-bootstrap";
import { useDocuments } from "../../contexts/DocumentContext";
import { useFolders } from "../../contexts/FolderContext";
import { useInvites } from "../../contexts/InviteContext";
import InvitesModal from "../InvitesModal";
import Folder from "./Folder";

export default function FolderStructure({onDocumentSelect}) {
  const { documents, moveDocument } = useDocuments();
  const { moveFolder, createFolder } = useFolders();
  const { invites } = useInvites();
  const [showInvites, setShowInvites] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);

  const handleDragStart = (id) => {
    setDraggedItemId(id);
  };

  // Helper function to find an item by ID in the folder structure
  const findItemById = (id, node = documents) => {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findItemById(id, child);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDrop = (targetFolderId) => {
    if (draggedItemId) {
      // Find the dragged item to determine if it's a folder or document
      const draggedItem = findItemById(draggedItemId);
      
      if (draggedItem) {
        if (draggedItem.type === 'folder') {
          // Use moveFolder for folders
          moveFolder(draggedItemId, targetFolderId);
        } else {
          // Use moveDocument for documents
          moveDocument(draggedItemId, targetFolderId);
        }
      }
      
      setDraggedItemId(null); // Reset dragged item ID
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
  };

  const handleAddFolder = () => {
    // Create a new folder at the root level with parent ID 0
    createFolder(0, "New Folder");
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 editor-header">
        <h5 className="mb-0">{documents.name}</h5>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button size="sm" onClick={handleAddFolder}>Add Folder</Button>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowInvites(true)}
        >
          Invites
          {invites.length > 0 && (
            <Badge bg="primary" className="ms-2" style={{ fontSize: "0.75em" }}>
              {invites.length}
            </Badge>
          )}
        </Button>
      </div>

      <ListGroup>
        {documents?.children && documents.children.map((item) => (
          <Folder
            key={item.id}
            item={item}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDocumentSelect={onDocumentSelect}
          />
        ))}
      </ListGroup>

      <InvitesModal show={showInvites} onHide={() => setShowInvites(false)} />
    </div>
  );
}
