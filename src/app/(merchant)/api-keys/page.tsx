'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Button,
} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Changed import
import { CopyIcon, Trash2Icon } from 'lucide-react';

// Define a type for our API Key data
type ApiKey = {
  id: string;
  name?: string;
  key_prefix: string;
  status: 'active' | 'revoked';
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
};

// Schema for creating a new API key
const createApiKeySchema = z.object({
  name: z.string().optional(),
});

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

export default function ApiKeysPage() {
  // Removed: const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
    },
  });

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/merchant/api-keys');
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      setApiKeys(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error', { description: 'Could not load API keys.' }); // Updated toast
    } finally {
      setLoading(false);
    }
  }, []); // Removed toast from dependency array

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const onCreateKey = async (values: CreateApiKeyFormValues) => {
    try {
      const response = await fetch('/api/merchant/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setNewlyGeneratedKey(data.fullApiKey);
      form.reset(); // Clear form after successful creation
      fetchApiKeys(); // Refresh the list of keys
      toast.success('Success', { description: 'New API key created.' }); // Updated toast
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Could not create API key.' }); // Updated toast
    }
  };

  const onRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/merchant/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      fetchApiKeys(); // Refresh the list of keys
      toast.success('Success', { description: 'API key revoked.' }); // Updated toast
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Could not revoke API key.' }); // Updated toast
    }
  };

  const onCopyKey = () => {
    if (newlyGeneratedKey) {
      navigator.clipboard.writeText(newlyGeneratedKey);
      toast.success('Copied', { description: 'API key copied to clipboard.' }); // Updated toast
    }
  };

  if (loading) {
    return <div>Loading API keys...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">API Keys</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setNewlyGeneratedKey(null)}>Create New Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                API keys are used to authenticate your applications with FlowKora.
              </DialogDescription>
            </DialogHeader>
            {!newlyGeneratedKey ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateKey)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="My Production Key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Creating...' : 'Create Key'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Please copy your new API key now. You will not be able to see it again.</p>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input type="text" value={newlyGeneratedKey} readOnly />
                  <Button type="button" size="sm" onClick={onCopyKey}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={() => setIsDialogOpen(false)}>Done</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length > 0 ? (
              apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name || '-'}</TableCell>
                  <TableCell>{key.key_prefix}...</TableCell>
                  <TableCell>{key.status}</TableCell>
                  <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell className="text-right">
                    {key.status === 'active' && (
                      <Button variant="destructive" size="sm" onClick={() => onRevokeKey(key.id)}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No API keys found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
