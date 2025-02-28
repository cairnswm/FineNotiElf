import React, { useRef } from 'react';
import { ListGroup, FormCheck, Badge, Button } from 'react-bootstrap';
import { Trash, Calendar, Pencil, ArrowUp, ArrowDown, GripVertical } from 'react-bootstrap-icons';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'LIST_ITEM';

const ListItem = ({ 
  item, 
  index,
  listSettings, 
  document, 
  toggleChecked, 
  moveToTop, 
  moveToBottom, 
  startEditing, 
  deleteItem,
  moveItem
}) => {
  // Reference to the DOM element
  const ref = useRef(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !document.readonly,
  });

  // Set up drop target
  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop refs
  drag(drop(ref));

  return (
    <ListGroup.Item 
      ref={ref}
      key={item.id}
      className={`d-flex align-items-center ${isDragging ? 'dragging' : ''}`}
      data-handler-id={handlerId}
    >
      {!document.readonly && (
        <div className="me-2 drag-handle">
          <GripVertical />
        </div>
      )}
      {/* Checkbox on the left */}
      <FormCheck 
        className="me-2"
        checked={item.checked}
        onChange={() => toggleChecked(item.id)}
        disabled={document.readonly}
      />
      
      {/* Item content */}
      <div className="ms-2 me-auto">
        <div 
          className="fw-bold" 
          style={item.checked ? { textDecoration: 'line-through' } : {}}
        >
          {item.name}
        </div>
        {item.description && (
          <div style={item.checked ? { textDecoration: 'line-through' } : {}}>
            {item.description}
          </div>
        )}
        {item.due && listSettings.hasDueDates && (
          <div className="mt-1">
            <Badge bg={new Date(item.due) < new Date() && !item.checked ? 'danger' : 'info'}>
              <Calendar className="me-1" /> {formatDate(item.due)}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="d-flex">
        {/* Up/Down arrow button */}
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="me-1"
          onClick={() => item.checked ? moveToTop(item.id) : moveToBottom(item.id)}
          disabled={document.readonly}
          title={item.checked ? "Move to top" : "Move to bottom"}
        >
          {item.checked ? <ArrowUp /> : <ArrowDown />}
        </Button>
        
        {!document.readonly && (
          <>
            <Button 
              variant="outline-primary" 
              size="sm" 
              className="me-1"
              onClick={() => startEditing(item)}
              disabled={document.readonly}
            >
              <Pencil />
            </Button>
            
            {listSettings.canDelete && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => deleteItem(item.id)}
                disabled={document.readonly}
              >
                <Trash />
              </Button>
            )}
          </>
        )}
      </div>
    </ListGroup.Item>
  );
};

export default ListItem;
