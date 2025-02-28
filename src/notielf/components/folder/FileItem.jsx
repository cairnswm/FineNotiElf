import React from "react";
import { ListGroup } from "react-bootstrap";
import { useDocuments } from "../../contexts/DocumentContext";
import { FileEarmark, ListCheck } from "react-bootstrap-icons";

const FileItem = ({ item, onDragStart, onDocumentSelect }) => {
  const { setActiveDocument } = useDocuments();

  const handleClick = () => {
    setActiveDocument(item);
    console.log("FolderItem: Document Selected: ", item);
    if (onDocumentSelect) {
      onDocumentSelect(item);
    }
  };

  return (
    <ListGroup.Item
      action
      className="border-0 rounded mb-1 d-flex align-items-center"
      onClick={handleClick}
      draggable
      onDragStart={() => onDragStart(item.id)}
    >
      <span className="me-2">
        {item.type === 'list' ? <ListCheck className="text-primary" /> : <FileEarmark />}
      </span>
      {item.name}
    </ListGroup.Item>
  );
};

export default FileItem;
