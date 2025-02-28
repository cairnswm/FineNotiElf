import React, { useState } from "react";
import { ListGroup, Button, Badge } from "react-bootstrap";
import { useDocuments } from "../../contexts/DocumentContext";
import { useInvites } from "../../contexts/InviteContext";
import InvitesModal from "../InvitesModal";
import Folder from "./Folder";

export default function FolderStructure({onDocumentSelect}) {
  const { documents, moveDocument, addDocumentBefore } = useDocuments();
  const { invites } = useInvites();
  const [showInvites, setShowInvites] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);

  const handleDragStart = (id) => {
    setDraggedItemId(id);
  };

  const handleDrop = (targetFolderId) => {
    if (draggedItemId) {
      moveDocument(draggedItemId, targetFolderId);
      setDraggedItemId(null); // Reset dragged item ID
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
  };

  const handleAddFolder = () => {
    const newFolder = {
      name: "New Folder",
      type: "folder",
      children: []
    };
    addDocumentBefore('shared-folder', newFolder); // Add new folder before "Shared with Me"
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
        {documents.children.map((item) => (
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
