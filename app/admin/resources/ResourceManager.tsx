'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  ExternalLink,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Topic { id: number; name: string }
interface Resource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  type: string;
  isFeatured: boolean;
  tags: string[];
  topic?: { id: number; name: string } | null;
}

const schema = z.object({
  title: z.string().min(3, 'Too short').max(200),
  url: z.string().url('Must be a valid URL'),
  description: z.string().max(500).optional(),
  type: z.enum(['tool', 'template', 'guide', 'video']),
  topicId: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable().optional()
  ),
  isFeatured: z.boolean(),
  tags: z.string(),
});

type FormValues = z.infer<typeof schema>;

const typeColors: Record<string, string> = {
  tool: 'bg-blue-100 text-blue-700',
  template: 'bg-violet-100 text-violet-700',
  guide: 'bg-green-100 text-green-700',
  video: 'bg-red-100 text-red-700',
};

export function ResourceManager({
  resources: initial,
  topics,
}: {
  resources: Resource[];
  topics: Topic[];
}) {
  const [resources, setResources] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const currentResource = editingId ? resources.find((r) => r.id === editingId) : null;

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      title: '', url: '', description: '', type: 'tool',
      topicId: null, isFeatured: false, tags: '',
    },
  });

  function openNew() {
    setEditingId(null);
    reset({ title: '', url: '', description: '', type: 'tool', topicId: null, isFeatured: false, tags: '' });
    setShowForm(true);
  }

  function openEdit(r: Resource) {
    setEditingId(r.id);
    reset({
      title: r.title, url: r.url, description: r.description ?? '',
      type: r.type as FormValues['type'],
      topicId: r.topic?.id ?? null,
      isFeatured: r.isFeatured,
      tags: r.tags.join(', '),
    });
    setShowForm(true);
  }

  async function onSubmit(data: FormValues) {
    const payload = {
      ...data,
      description: data.description || null,
      topicId: data.topicId || null,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    if (editingId) {
      const res = await fetch(`/api/resources/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast.error('Update failed'); return; }
      const json = await res.json() as { data: Resource };
      setResources((prev) => prev.map((r) => r.id === editingId ? { ...r, ...json.data } : r));
      toast.success('Resource updated!');
    } else {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast.error('Create failed'); return; }
      const json = await res.json() as { data: Resource };
      setResources((prev) => [json.data, ...prev]);
      toast.success('Resource created!');
    }
    setShowForm(false);
  }

  async function deleteResource(id: string) {
    if (!confirm('Delete this resource?')) return;
    setDeleting((p) => new Set(p).add(id));
    const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Delete failed'); }
    else { setResources((p) => p.filter((r) => r.id !== id)); toast.success('Deleted'); }
    setDeleting((p) => { const n = new Set(p); n.delete(id); return n; });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between">
        <div />
        <Button size="sm" onClick={openNew}>
          <Plus className="size-3.5" /> Add Resource
        </Button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <h3 className="font-semibold text-sm">
              {editingId ? 'Edit Resource' : 'New Resource'}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted">
              <X className="size-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Title *</Label>
                <Input {...register('title')} placeholder="Resource name" className="text-sm h-8" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">URL *</Label>
                <Input {...register('url')} placeholder="https://…" className="text-sm h-8" />
                {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Description</Label>
                <Input {...register('description')} placeholder="Short description" className="text-sm h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <select {...register('type')} className="w-full text-sm rounded-md border border-input bg-background px-2 py-1.5 h-8">
                  <option value="tool">Tool</option>
                  <option value="template">Template</option>
                  <option value="guide">Guide</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Topic</Label>
                <select {...register('topicId')} className="w-full text-sm rounded-md border border-input bg-background px-2 py-1.5 h-8">
                  <option value="">— None —</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input {...register('tags')} placeholder="startup, tool, free" className="text-sm h-8" />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" {...register('isFeatured')} className="rounded" />
                  Featured resource
                </label>
              </div>
              <div className="col-span-2 flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : (editingId ? 'Update' : 'Create')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Topic</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {resources.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No resources yet</td></tr>
            )}
            {resources.map((r) => (
              <tr key={r.id} className={cn('hover:bg-muted/30', deleting.has(r.id) && 'opacity-50')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {r.isFeatured && <Star className="size-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-primary transition-colors line-clamp-1 flex items-center gap-1"
                    >
                      {r.title} <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                    </a>
                  </div>
                </td>
                <td className="px-3 py-3 hidden sm:table-cell">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', typeColors[r.type])}>
                    {r.type}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{r.topic?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors" title="Edit">
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => deleteResource(r.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
