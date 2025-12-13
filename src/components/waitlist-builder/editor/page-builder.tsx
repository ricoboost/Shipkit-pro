'use client';

import { useEffect } from 'react';
import { useEditorStore } from './use-editor-state';
import { EditorToolbar } from './editor-toolbar';
import { SectionList } from './section-list';
import { EditorCanvas } from './editor-canvas';
import { EditorSidebar } from './editor-sidebar';
import { Loader2 } from 'lucide-react';

export function PageBuilder() {
  const { isLoading, loadFromServer, undo, redo, saveToServer, isDirty } =
    useEditorStore();

  // Load config on mount
  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveToServer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveToServer]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        <SectionList />
        <EditorCanvas />
        <EditorSidebar />
      </div>
    </div>
  );
}
