import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getAllTopics } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ArticleEditor } from '@/components/admin/ArticleEditor';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit: ${slug} | Admin` };
}

export default async function EditArticlePage({ params }: Props) {
  const { slug } = await params;

  const [article, topics] = await Promise.all([
    db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    }),
    getAllTopics(),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/articles" className="p-1.5 rounded-md hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Article</h1>
      </div>
      <ArticleEditor
        topics={topics}
        article={{
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary ?? null,
          content: article.content,
          topicId: article.topicId ?? null,
          difficulty: article.difficulty,
          stage: article.stage,
          tags: article.tags ?? [],
          isPublished: article.isPublished,
          isFeatured: article.isFeatured,
        }}
      />
    </div>
  );
}
