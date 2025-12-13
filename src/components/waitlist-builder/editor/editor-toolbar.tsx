'use client';

import { Button } from '@/components/ui/button';
import {
  Save,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Globe,
  GlobeLock,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useEditorStore } from './use-editor-state';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function EditorToolbar() {
  const {
    isDirty,
    isPreviewMode,
    isSaving,
    isPublishing,
    published,
    undoStack,
    redoStack,
    saveToServer,
    publishPage,
    resetToDefaults,
    togglePreviewMode,
    undo,
    redo,
  } = useEditorStore();

  const handleSave = async () => {
    try {
      await saveToServer();
      toast.success('Page saved successfully');
    } catch {
      toast.error('Failed to save page');
    }
  };

  const handlePublish = async () => {
    try {
      await publishPage(!published);
      toast.success(published ? 'Page unpublished' : 'Page published');
    } catch {
      toast.error('Failed to publish page');
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();
      toast.success('Page reset to defaults');
    } catch {
      toast.error('Failed to reset page');
    }
  };

  return (
    <div className="flex items-center justify-between border-b bg-background px-4 py-2">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Page Builder</h1>
        {isDirty && (
          <span className="text-xs text-muted-foreground">(unsaved)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={undoStack.length === 0}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={redoStack.length === 0}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview Toggle */}
        <Button
          variant={isPreviewMode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={togglePreviewMode}
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Exit Preview
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </>
          )}
        </Button>

        {/* Reset */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset the page to the default template. All your
                changes will be lost. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>

        {/* Publish */}
        <Button
          variant={published ? 'secondary' : 'default'}
          size="sm"
          onClick={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : published ? (
            <GlobeLock className="mr-2 h-4 w-4" />
          ) : (
            <Globe className="mr-2 h-4 w-4" />
          )}
          {published ? 'Unpublish' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
