import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useDocuments } from '../contexts/DocumentContext';
import { Alert } from 'react-bootstrap';
import MenuBar from './MenuBar';
import EditorHeader from './EditorHeader';
import './Editor.css';

export default function Editor() {
  const { activeDocument, updateDocumentContent, setReadOnly, isOwner } = useDocuments();
  const previousDocumentRef = useRef(null);

  const requestEditing = useCallback(() => {
    if (activeDocument?.id) {
      setReadOnly(activeDocument.id, false);
    }
  }, [activeDocument?.id, setReadOnly]);

  const finishEditing = useCallback(() => {
    if (activeDocument?.id) {
      setReadOnly(activeDocument.id, true);
    }
  }, [activeDocument?.id, setReadOnly]);

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
      if (activeDocument && !activeDocument.readonly) {
        const content = editor.getHTML();
        if (content !== activeDocument.content) {
          debouncedUpdateContent(activeDocument.id, content);
        }
      }
    },
    [activeDocument, debouncedUpdateContent]
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

  // Handle document changes and ensure previous document is set to readonly
  useEffect(() => {
    if (activeDocument?.id !== previousDocumentRef.current?.id) {
      // If there was a previous document and it was being edited, set it to readonly
      if (previousDocumentRef.current?.id && !previousDocumentRef.current?.readonly) {
        setReadOnly(previousDocumentRef.current.id, true);
      }
      
      // Update the previous document reference
      previousDocumentRef.current = activeDocument;
    }

    // Update editor content and editable state
    if (editor && activeDocument) {
      // Set content only if it's different to avoid cursor jumping
      if (editor.getHTML() !== activeDocument.content) {
        editor.commands.setContent(activeDocument.content || '');
      }
      editor.setEditable(!activeDocument.readonly);
    }
  }, [editor, activeDocument, setReadOnly]);

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

  if (!activeDocument) {
    return (
      <Alert variant="info">
        Select a document from the sidebar to start editing
      </Alert>
    );
  }

  return (
    <div>
      <EditorHeader
        document={activeDocument}
        isOwner={isOwner}
        onRequestEdit={requestEditing}
        onFinishEdit={finishEditing}
      />

      <MenuBar editor={editor} readonly={activeDocument.readonly} />
      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
}
