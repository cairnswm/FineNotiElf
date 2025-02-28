import React, { useState, useRef } from 'react';
import { Button, ButtonGroup, Overlay } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import './MenuBar.css';
import { Check2Square, EmojiSmile, ListOl, ListUl, TypeBold, TypeItalic, TypeStrikethrough, TypeUnderline } from 'react-bootstrap-icons';

export default function MenuBar({ editor, readonly }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef(null);

  if (!editor) {
    return null;
  }

  const onEmojiClick = (emojiData) => {
    editor.commands.insertContent(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="editor-menu mb-2">
      <ButtonGroup className="me-2">
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
          disabled={readonly}
        >
          H1
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
          disabled={readonly}
        >
          H2
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
          disabled={readonly}
        >
          H3
        </Button>
      </ButtonGroup>

      <ButtonGroup className="me-2">
        <Button
          variant={editor.isActive('bold') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
          disabled={readonly}
          title="Bold"
        >
          <TypeBold />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
          disabled={readonly}
          title="Italic"
        >
          <TypeItalic />
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'active' : ''}
          disabled={readonly}
          title="Underline"
        >
          <TypeUnderline />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'active' : ''}
          disabled={readonly}
          title="Strikethrough"
        >
          <TypeStrikethrough />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="me-2">
        <Button
          variant={editor.isActive('bulletList') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'active' : ''}
          disabled={readonly}
          title="Bullet List"
        >
          <ListUl />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'active' : ''}
          disabled={readonly}
          title="Numbered List"
        >
          <ListOl />
        </Button>
        <Button
          variant={editor.isActive('taskList') ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={editor.isActive('taskList') ? 'active' : ''}
          disabled={readonly}
          title="Checklist"
        >
          <Check2Square />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button
          ref={emojiButtonRef}
          variant="outline-primary"
          size="sm"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={readonly}
          title="Insert Emoji"
        >
          <EmojiSmile />
        </Button>
      </ButtonGroup>

      <Overlay 
        target={emojiButtonRef.current} 
        show={showEmojiPicker} 
        placement="bottom"
        rootClose
        onHide={() => setShowEmojiPicker(false)}
      >
        {({ placement, arrowProps, show: _show, popper, ...props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              zIndex: 1000,
            }}
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width={300}
              height={400}
            />
          </div>
        )}
      </Overlay>
    </div>
  );
}
