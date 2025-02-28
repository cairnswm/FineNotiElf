import React, { useState } from "react";
import { ListGroup, Button, ButtonGroup } from "react-bootstrap";
import { useDocuments } from "../../contexts/DocumentContext";
import NameChangeModal from "./NameChangeModal";
import { File, Folder, Pencil, Plus } from "react-bootstrap-icons";

const FolderItem = ({ item, depth = 0, onDragStart, onDrop, onDragOver }) => {
  const { setActiveDocument, addDocument } = useDocuments();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (item.type === "document") {
      setActiveDocument(item);
    }
  };

  const handleAddFile = () => {
    addDocument(item.id, {
      id: Date.now().toString(),
      name: "New File",
      type: "document",
      content: "",
      owner: "cairnswm@gmail.com",
      sharedWith: [],
      readonly: true,
    });
  };

  const handleAddFolder = () => {
    addDocument(item.id, { id: Date.now().toString(), name: "New Folder", type: "folder" });
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
          <Button variant="outline-primary" size="sm" onClick={handleShowModal}>
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
        show={showModal}
        handleClose={handleCloseModal}
        item={item}
      />
    </div>
  );
};

export default FolderItem;
