'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Globe, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import '@uiw/react-md-editor/markdown-editor.css';

// Lazy-load to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Topic {
  id: number;
  name: string;
  slug: string;
}

interface ArticleEditorProps {
  topics: Topic[];
  article?: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    content: string;
    topicId: number | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    stage: 'idea' | 'early' | 'growth' | 'scale';
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
  };
}

const schema = z.object({
  title: z.string().min(3, 'Title too short').max(200),
  summary: z.string().max(500).optional(),
  topicId: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().nullable().optional()
  ),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  stage: z.enum(['idea', 'early', 'growth', 'scale']),
  tags: z.string(), // comma-separated, parsed later
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ArticleEditor({ topics, article }: ArticleEditorProps) {
  const router = useRouter();
  const isEdit = !!article;
  const [content, setContent] = useState(article?.content ?? '');

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      title: article?.title ?? '',
      summary: article?.summary ?? '',
      topicId: article?.topicId ?? null,
      difficulty: article?.difficulty ?? 'beginner',
      stage: article?.stage ?? 'idea',
      tags: article?.tags?.join(', ') ?? '',
      isPublished: article?.isPublished ?? false,
      isFeatured: article?.isFeatured ?? false,
    },
  });

  async function onSubmit(data: FormValues, publish?: boolean) {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    const payload = {
      title: data.title,
      summary: data.summary || null,
      content,
      topicId: data.topicId || null,
      difficulty: data.difficulty,
      stage: data.stage,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isPublished: publish !== undefined ? publish : data.isPublished,
      isFeatured: data.isFeatured,
    };

    let res: Response;
    if (isEdit) {
      res = await fetch(`/api/articles/${article.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? 'Save failed');
      return;
    }

    const json = await res.json() as { data?: { slug?: string; id?: string } };
    const savedSlug = json.data?.slug ?? article?.slug;

    toast.success(isEdit ? 'Article updated!' : 'Article created!');

    // Trigger re-embedding if published
    if ((publish || data.isPublished) && json.data?.id) {
      fetch(`/api/embed/${json.data.id}`, { method: 'POST' }).catch(() => null);
    }

    router.push('/admin/articles');
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Main content */}
      <div className="lg:col-span-2 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="Article title…" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            placeholder="1-2 sentence description…"
            {...register('summary')}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Content (Markdown) *</Label>
          <div data-color-mode="light" className="rounded-lg overflow-hidden border border-border">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val ?? '')}
              height={480}
              preview="edit"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Publish actions */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Publish</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => void handleSubmit((d: FormValues) => onSubmit(d, false))()}
            >
              <Save className="size-3.5" />
              {isSubmitting ? 'Saving…' : 'Save Draft'}
            </Button>
            <Button
              type="button"
              size="sm"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => void handleSubmit((d: FormValues) => onSubmit(d, true))()}
            >
              <Globe className="size-3.5" />
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : 'Publish'}
            </Button>
          </CardContent>
        </Card>

        {/* Topic */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Topic</h3>
          </CardHeader>
          <CardContent>
            <select
              {...register('topicId')}
              className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">— No topic —</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Metadata</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Difficulty</Label>
              <select
                {...register('difficulty')}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Stage</Label>
              <select
                {...register('stage')}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="idea">💡 Idea</option>
                <option value="early">🌱 Early</option>
                <option value="growth">📈 Growth</option>
                <option value="scale">🚀 Scale</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                placeholder="startup, funding, mvp"
                {...register('tags')}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Toggles */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Options</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Featured article</span>
                </label>
              )}
            />
            <Controller
              name="isPublished"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Published</span>
                </label>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
