'use client';

import { Type, Image, MousePointerClick, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEditorStore } from '../editor/use-editor-state';

interface AddElementToolbarProps {
  sectionId: string;
}

export function AddElementToolbar({ sectionId }: AddElementToolbarProps) {
  const { addBlock, isPreviewMode } = useEditorStore();

  if (isPreviewMode) return null;

  return (
    <div className="flex items-center justify-center py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Element
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => addBlock(sectionId, 'text')}>
            <Type className="mr-2 h-4 w-4" />
            Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addBlock(sectionId, 'image')}>
            <Image className="mr-2 h-4 w-4" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addBlock(sectionId, 'button')}>
            <MousePointerClick className="mr-2 h-4 w-4" />
            Button
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
