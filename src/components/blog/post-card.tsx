/**
 * Blog Post Card
 * Displays a blog post preview
 */

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BlogPostMeta } from '@/lib/blog';

interface PostCardProps {
  post: BlogPostMeta;
  featured?: boolean;
}

export function PostCard({ post, featured }: PostCardProps) {
  const formattedDate = formatDistanceToNow(new Date(post.date), { addSuffix: true });

  if (featured) {
    return (
      <article className="group relative flex flex-col md:flex-row gap-6 rounded-lg border bg-card p-4 hover:shadow-lg transition-shadow">
        {post.image && (
          <div className="relative md:w-1/2 aspect-video rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
          </Link>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center gap-3 mt-auto">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.image} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{post.author.name}</p>
              <p className="text-muted-foreground">
                {formattedDate} · {post.readingTime}
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow">
      {post.image && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-2 mt-auto text-sm text-muted-foreground">
          <span>{formattedDate}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
      </div>
    </article>
  );
}
