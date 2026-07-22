'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SaveArticleButtonProps {
  articleId: string;
  className?: string;
}

export function SaveArticleButton({ articleId, className }: SaveArticleButtonProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial saved state
  useEffect(() => {
    if (!user) return;
    fetch('/api/saved')
      .then((r) => r.json())
      .then((data: { data?: { articleId: string }[] }) => {
        const isSaved = data.data?.some((s) => s.articleId === articleId) ?? false;
        setSaved(isSaved);
      })
      .catch(() => {});
  }, [user, articleId]);

  async function handleToggle() {
    if (!user) {
      toast.error('Sign in to save articles');
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await fetch(`/api/saved/${articleId}`, { method: 'DELETE' });
        setSaved(false);
        toast.success('Removed from saved');
      } else {
        await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        });
        setSaved(true);
        toast.success('Article saved!');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
