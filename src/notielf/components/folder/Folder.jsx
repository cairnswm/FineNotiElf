import React from "react";
import { ListGroup } from "react-bootstrap";
import { useDocuments } from "../../contexts/DocumentContext";
import FileItem from "./FileItem";
import FolderItem from "./FolderItem";

const Folder = ({
  item,
  depth = 0,
  onDragStart,
  onDrop,
  onDragOver,
  onDocumentSelect,
}) => {
  return (
    <div
      style={{ marginLeft: `${depth * 1.5}rem` }}
      onDrop={() => onDrop(item.id)}
      onDragOver={onDragOver}
    >
      {item.type === "folder" ? (
        <FolderItem
          item={item}
          depth={depth}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDocumentSelect={onDocumentSelect}
        />
      ) : (
        <FileItem
          item={item}
          onDragStart={onDragStart}
          onDocumentSelect={onDocumentSelect}
        />
      )}

      {item.type === "folder" && item.children && (
        <div>
          {item.children.map((child) => (
            <Folder
              key={child.id}
              item={child}
              depth={depth + 1}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDocumentSelect={onDocumentSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
