import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

type Post = { slug: string; title: string; date: string; description: string; image: string; body: string };
const posts = JSON.parse(readFileSync('src/data/blog.json', 'utf8')) as Post[];

it('keeps the complete published source article inventory with unique local routes', () => {
  expect(posts).toHaveLength(13);
  expect(new Set(posts.map(post => post.slug)).size).toBe(posts.length);
  for (const post of posts) {
    expect(post.slug).toMatch(/^[a-z0-9-]+$/);
    expect(post.title.length).toBeGreaterThan(10);
    expect(post.description.length).toBeGreaterThan(40);
    expect(post.date).toMatch(/^20\d\d-\d\d-\d\d$/);
    expect(post.image).toBe(`/images/blog/${post.slug}.webp`);
    expect(existsSync(`public${post.image}`)).toBe(true);
  }
});

it('stores sanitized source HTML without WordPress runtime dependencies', () => {
  for (const post of posts) {
    expect(post.body).toMatch(/<(?:p|h2|h3|ul|ol)[ >]/);
    expect(post.body).not.toMatch(/wp-content|<script|<iframe|<form|<img|\son\w+=|javascript:/i);
    expect(post.body).not.toMatch(/\/(?:faq|toc)-block|\"headings\"\s*:/i);
    expect(post.body).not.toContain('wp:');

    const ids = [...post.body.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  }
});
