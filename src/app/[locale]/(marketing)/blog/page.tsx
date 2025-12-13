/**
 * Blog Listing Page
 * Displays all published blog posts
 */

import { Suspense } from 'react';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { PostCard } from '@/components/blog/post-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Blog',
  description: 'Latest articles, tutorials, and updates from the ShipKit team.',
};

async function BlogContent() {
  const [posts, tags] = await Promise.all([getAllPosts(), getAllTags()]);

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
        <p className="text-muted-foreground">
          Check back soon for new content!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Featured Post */}
      {featuredPost && (
        <section className="mb-12">
          <PostCard post={featuredPost} featured />
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map(({ tag, count }) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
              >
                {tag} ({count})
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Post Grid */}
      {regularPosts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Latest Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Latest articles, tutorials, and updates from the ShipKit team.
          Learn how to build better SaaS products.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-12">
        <Input
          type="search"
          placeholder="Search articles..."
          className="w-full"
        />
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card h-64 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <BlogContent />
      </Suspense>
    </main>
  );
}
