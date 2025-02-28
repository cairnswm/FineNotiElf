import React, { useState } from "react";
import { ListGroup, Button, ButtonGroup } from "react-bootstrap";
import { useDocuments } from "../../contexts/DocumentContext";
import { useFolders } from "../../contexts/FolderContext";
import NameChangeModal from "./NameChangeModal";
import AddDocumentModal from "./adddocumentmodal";
import { File, Folder, Pencil, Plus } from "react-bootstrap-icons";

const FolderItem = ({ item, depth = 0, onDragStart, onDrop, onDragOver }) => {
  const { setActiveDocument, addDocument } = useDocuments();
  const { createFolder } = useFolders();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [defaultDocumentType, setDefaultDocumentType] = useState("document");

  const handleClick = () => {
    if (item.type === "document") {
      setActiveDocument(item);
    }
  };

  const handleAddFile = () => {
    setDefaultDocumentType("document");
    setShowDocumentModal(true);
  };


  const handleAddFolder = () => {
    createFolder(item.id, "New Folder");
  };

  const handleShowNameModal = () => {
    setShowNameModal(true);
  };

  const handleCloseNameModal = () => {
    setShowNameModal(false);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
  };

  return (
    <div
      style={{ marginLeft: `${depth * 1.5}rem` }}
      onDrop={() => onDrop(item.id)}
      onDragOver={onDragOver}
    >
      <ListGroup.Item
        action={item.type === "document"}
        className="border-0 rounded mb-1 d-flex align-items-center"
        onClick={handleClick}
        draggable
        onDragStart={() => onDragStart(item.id)}
      >
        <span className="me-2">📁</span>
        {item.name}
        <ButtonGroup className="ms-auto">
          <Button variant="outline-primary" size="sm" onClick={handleShowNameModal}>
            <Pencil />
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleAddFolder}>
            <Plus />
            <Folder />
          </Button>
          <Button variant="outline-primary" size="sm" onClick={handleAddFile}>
            <Plus />
            <File />
          </Button>
        </ButtonGroup>
      </ListGroup.Item>

      <NameChangeModal
        show={showNameModal}
        handleClose={handleCloseNameModal}
        item={item}
      />

      <AddDocumentModal
        show={showDocumentModal}
        handleClose={handleCloseDocumentModal}
        folderId={item.id}
        defaultType={defaultDocumentType}
      />
    </div>
  );
};

export default FolderItem;
