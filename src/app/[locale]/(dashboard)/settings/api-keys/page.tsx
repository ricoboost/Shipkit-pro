'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

// Mock data
const initialKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: 'Dec 1, 2024',
    lastUsed: 'Dec 9, 2024',
  },
  {
    id: '2',
    name: 'Development Key',
    key: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: 'Nov 15, 2024',
    lastUsed: 'Dec 8, 2024',
  },
];

export default function ApiKeysPage(): React.JSX.Element {
  const t = useTranslations('settings.apiKeys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (id: string): void => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    toast.success(t('copied'));
  };

  const createApiKey = async (): Promise<void> => {
    if (!newKeyName.trim()) {
      toast.error(t('enterKeyName'));
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a mock key
      const mockKey = `sk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      setNewKeyValue(mockKey);

      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: mockKey.substring(0, 15) + 'x'.repeat(mockKey.length - 15),
        createdAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        lastUsed: null,
      };

      setApiKeys((prev) => [newKey, ...prev]);
      toast.success(t('keyCreated'));
    } catch {
      toast.error(t('createError'));
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (id: string): Promise<void> => {
    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setApiKeys((prev) => prev.filter((key) => key.id !== id));
      toast.success(t('keyDeleted'));
    } catch {
      toast.error(t('deleteError'));
    }
  };

  const handleDialogClose = (): void => {
    setDialogOpen(false);
    setNewKeyName('');
    setNewKeyValue(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createNewKey')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createApiKey')}</DialogTitle>
              <DialogDescription>
                {newKeyValue
                  ? t('keyCreatedDesc')
                  : t('createKeyDesc')}
              </DialogDescription>
            </DialogHeader>
            {newKeyValue ? (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <code className="break-all text-sm">{newKeyValue}</code>
                </div>
                <Button
                  className="w-full"
                  onClick={() => copyToClipboard(newKeyValue)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {t('copyApiKey')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">{t('keyName')}</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder={t('keyNamePlaceholder')}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              {newKeyValue ? (
                <Button onClick={handleDialogClose}>{t('done')}</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleDialogClose}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={createApiKey} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('createKey')}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys list */}
      <Card>
        <CardHeader>
          <CardTitle>{t('yourApiKeys')}</CardTitle>
          <CardDescription>
            {t('apiKeysDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('noApiKeys')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('createFirstKey')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{apiKey.name}</p>
                      {!apiKey.lastUsed && (
                        <Badge variant="secondary">{t('neverUsed')}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {visibleKeys.has(apiKey.id)
                          ? apiKey.key
                          : apiKey.key.substring(0, 10) + '•'.repeat(20)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('created', { date: apiKey.createdAt })}
                      {apiKey.lastUsed && ` • ${t('lastUsed', { date: apiKey.lastUsed })}`}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteApiKey')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteKeyDesc', { name: apiKey.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('apiUsage')}</CardTitle>
          <CardDescription>
            {t('apiUsageDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-medium">{t('includeInHeaders')}</p>
            <code className="block rounded bg-muted p-4 text-sm">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <p className="mb-2 font-medium">{t('exampleCurl')}</p>
            <code className="block whitespace-pre-wrap rounded bg-muted p-4 text-sm">
{`curl -X POST https://api.shipkit.dev/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4o-mini", "messages": [...]}'`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
