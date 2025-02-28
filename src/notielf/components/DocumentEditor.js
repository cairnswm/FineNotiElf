import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import MenuBar from './MenuBar';
import './Editor.css';

const DocumentEditor = ({ document, updateDocumentContent }) => {
  const [debouncedContent, setDebouncedContent] = useState('');
  const debounceTimeoutRef = useRef(null);

  const debouncedUpdateContent = useCallback(
    (id, content) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      setDebouncedContent(content);
      
      debounceTimeoutRef.current = setTimeout(() => {
        updateDocumentContent(id, content);
        debounceTimeoutRef.current = null;
      }, 500); // 500ms debounce time
    },
    [updateDocumentContent]
  );

  const onUpdate = useCallback(
    ({ editor }) => {
      if (document && !document.readonly) {
        const content = editor.getHTML();
        if (content !== document.content) {
          debouncedUpdateContent(document.id, content);
        }
      }
    },
    [document, debouncedUpdateContent]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        listItem: {
          keepMarks: true,
        },
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: '',
    editable: false,
    autofocus: true,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate,
  });

  // Update editor content and editable state
  useEffect(() => {
    if (editor && document) {
      // Set content only if it's different to avoid cursor jumping
      if (editor.getHTML() !== document.content) {
        editor.commands.setContent(document.content || '');
      }
      editor.setEditable(!document.readonly);
    }
  }, [editor, document]);

  // Cleanup editor and debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [editor]);

  return (
    <>
      <MenuBar editor={editor} readonly={document.readonly} />
      <EditorContent editor={editor} className="tiptap" />
    </>
  );
};

export default DocumentEditor;
