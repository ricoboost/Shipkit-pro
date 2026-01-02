'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Power,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function EditorToolbar() {
  const {
    isDirty,
    isPreviewMode,
    isSaving,
    isPublishing,
    published,
    waitlistActive,
    isTogglingWaitlist,
    undoStack,
    redoStack,
    saveToServer,
    publishPage,
    toggleWaitlistActive,
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

  const handleToggleWaitlist = async () => {
    try {
      await toggleWaitlistActive();
      toast.success(waitlistActive ? 'Waitlist deactivated' : 'Waitlist activated');
    } catch {
      toast.error('Failed to toggle waitlist');
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Page Builder</h1>
            {isDirty && (
              <span className="text-xs text-muted-foreground">(unsaved)</span>
            )}
          </div>

          {/* Waitlist Active Toggle */}
          <div className="flex items-center gap-2 border-l pl-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Switch
                    id="waitlist-active"
                    checked={waitlistActive}
                    onCheckedChange={handleToggleWaitlist}
                    disabled={isTogglingWaitlist}
                  />
                  <Label
                    htmlFor="waitlist-active"
                    className="flex items-center gap-1.5 text-sm font-medium cursor-pointer"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Active
                    {waitlistActive ? (
                      <Badge variant="default" className="ml-1 bg-green-600 text-xs">
                        ON
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        OFF
                      </Badge>
                    )}
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium">Waitlist Mode</p>
                <p className="text-xs text-muted-foreground">
                  When active, visitors cannot register and are redirected to join the waitlist.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
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
    </TooltipProvider>
  );
}
