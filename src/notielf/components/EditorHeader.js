import React, { useState } from "react";
import { Button } from "react-bootstrap";
import EditingControls from "./EditingControls";
import ShareModal from "./ShareModal";
import NameChangeModal from "./folder/NameChangeModal";
import { useDocuments } from "../contexts/DocumentContext";
import { Pencil, Share } from "react-bootstrap-icons";

export default function EditorHeader({
  document,
  isOwner,
  onRequestEdit,
  onFinishEdit,
}) {
  const { updateDocumentName } = useDocuments(); // Access the context function
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNameChangeModal, setShowNameChangeModal] = useState(false);

  return (
    <div className="mb-3 editor-header">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex">
          <h4 className="mb-0" onClick={() => setShowNameChangeModal(true)}>
            {document.name}
          </h4>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowNameChangeModal(true)}
            className="ms-2" // Add margin to the left of the button
          >
            <Pencil />
          </Button>
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowShareModal(true)}
          className="ms-2"
        >
          <Share /> Share
        </Button>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <EditingControls
          isReadOnly={document.readonly}
          onRequestEdit={onRequestEdit}
          onFinishEdit={onFinishEdit}
        />
      </div>

      <ShareModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        document={document}
      />
      
      <NameChangeModal
        show={showNameChangeModal}
        handleClose={() => setShowNameChangeModal(false)}
        item={document}
      />
    </div>
  );
}
