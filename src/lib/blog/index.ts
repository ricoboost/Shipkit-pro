/**
 * Blog Content Library
 * Reads and processes MDX blog posts with error handling and caching
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { unstable_cache } from 'next/cache';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const BLOG_CACHE_TAG = 'blog-posts';
const BLOG_CACHE_REVALIDATE = 3600; // 1 hour

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: {
    name: string;
    image?: string;
    twitter?: string;
  };
  image?: string;
  tags: string[];
  published: boolean;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function getMDXFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  try {
    return fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'));
  } catch (error) {
    console.error('[Blog] Failed to read directory:', error);
    return [];
  }
}

// Safe file read helper with error handling
function safeReadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`[Blog] Failed to read file: ${filePath}`, error);
    return null;
  }
}

function parseFrontmatter(fileContent: string): { data: Record<string, unknown>; content: string } {
  const { data, content } = matter(fileContent);
  return { data, content };
}

function getSlugFromPath(filePath: string): string {
  return path.basename(filePath, '.mdx');
}

// Safe parsing helper that extracts post metadata with validation
function parsePostMeta(file: string, fileContent: string): BlogPostMeta | null {
  try {
    const { data, content } = parseFrontmatter(fileContent);
    const slug = getSlugFromPath(file);
    const stats = readingTime(content);

    // Safely extract author data
    const authorData = data.author as Record<string, unknown> | undefined;

    return {
      slug,
      title: String(data.title ?? 'Untitled'),
      description: String(data.description ?? ''),
      date: String(data.date ?? new Date().toISOString()),
      author: {
        name: String(authorData?.name ?? 'Anonymous'),
        image: authorData?.image ? String(authorData.image) : undefined,
        twitter: authorData?.twitter ? String(authorData.twitter) : undefined,
      },
      image: data.image ? String(data.image) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      published: data.published !== false,
      readingTime: stats.text,
    };
  } catch (error) {
    console.error(`[Blog] Failed to parse post: ${file}`, error);
    return null;
  }
}

// Internal implementation for getAllPosts
async function getAllPostsInternal(): Promise<BlogPostMeta[]> {
  const files = getMDXFiles(BLOG_DIR);

  const posts = files
    .map((file) => {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = safeReadFile(filePath);
      if (!fileContent) return null;

      return parsePostMeta(file, fileContent);
    })
    .filter((post): post is BlogPostMeta => post !== null && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

// Cached version of getAllPosts
export const getAllPosts = unstable_cache(
  getAllPostsInternal,
  ['blog-all-posts'],
  { revalidate: BLOG_CACHE_REVALIDATE, tags: [BLOG_CACHE_TAG] }
);

// Internal implementation for getPostBySlug
async function getPostBySlugInternal(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = safeReadFile(filePath);
  if (!fileContent) return null;

  try {
    const { data, content } = parseFrontmatter(fileContent);
    const stats = readingTime(content);

    // Safely extract author data
    const authorData = data.author as Record<string, unknown> | undefined;

    return {
      slug,
      title: String(data.title ?? 'Untitled'),
      description: String(data.description ?? ''),
      date: String(data.date ?? new Date().toISOString()),
      author: {
        name: String(authorData?.name ?? 'Anonymous'),
        image: authorData?.image ? String(authorData.image) : undefined,
        twitter: authorData?.twitter ? String(authorData.twitter) : undefined,
      },
      image: data.image ? String(data.image) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      published: data.published !== false,
      readingTime: stats.text,
      content,
    };
  } catch (error) {
    console.error(`[Blog] Failed to parse post: ${slug}`, error);
    return null;
  }
}

// Cached version of getPostBySlug
export const getPostBySlug = unstable_cache(
  getPostBySlugInternal,
  ['blog-post'],
  { revalidate: BLOG_CACHE_REVALIDATE, tags: [BLOG_CACHE_TAG] }
);

export async function getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  try {
    const posts = await getAllPosts();
    return posts.filter((post) => post.tags?.includes(tag));
  } catch (error) {
    console.error(`[Blog] Failed to get posts by tag "${tag}":`, error);
    return [];
  }
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  try {
    const posts = await getAllPosts();
    const tagCount: Record<string, number> = {};

    posts.forEach((post) => {
      post.tags?.forEach((tag) => {
        if (tag) {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        }
      });
    });

    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('[Blog] Failed to get all tags:', error);
    return [];
  }
}

export async function getRecentPosts(limit: number = 5): Promise<BlogPostMeta[]> {
  try {
    const posts = await getAllPosts();
    return posts.slice(0, limit);
  } catch (error) {
    console.error('[Blog] Failed to get recent posts:', error);
    return [];
  }
}

export async function getRelatedPosts(currentSlug: string, limit: number = 3): Promise<BlogPostMeta[]> {
  try {
    const current = await getPostBySlug(currentSlug);
    if (!current) return [];

    const posts = await getAllPosts();
    const otherPosts = posts.filter((p) => p.slug !== currentSlug);

    // Score posts by tag overlap (with null safety)
    const currentTags = current.tags ?? [];
    const scored = otherPosts.map((post) => {
      const postTags = post.tags ?? [];
      const tagOverlap = postTags.filter((tag) => currentTags.includes(tag)).length;
      return { post, score: tagOverlap };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.post);
  } catch (error) {
    console.error(`[Blog] Failed to get related posts for "${currentSlug}":`, error);
    return [];
  }
}

export async function searchPosts(query: string): Promise<BlogPostMeta[]> {
  try {
    const posts = await getAllPosts();
    const lowQuery = query.toLowerCase();

    return posts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(lowQuery);
      const descMatch = post.description?.toLowerCase().includes(lowQuery);
      const tagMatch = post.tags?.some((tag) => tag?.toLowerCase().includes(lowQuery));
      return titleMatch || descMatch || tagMatch;
    });
  } catch (error) {
    console.error(`[Blog] Failed to search posts for "${query}":`, error);
    return [];
  }
}
