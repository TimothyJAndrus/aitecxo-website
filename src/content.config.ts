import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    industry: z.string(),
    summary: z.string(),
    services: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
    publishDate: z.coerce.date(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('AITeCXO'),
    publishDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // Optional hero image: a path under public/ (e.g. '/insights/<slug>.jpg').
    // Also used as the social-share (og:image) card for the post.
    image: z.string().startsWith('/').optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }).refine((d) => !d.image || !!d.imageAlt, {
    message: 'imageAlt is required when image is set',
    path: ['imageAlt'],
  }),
});

export const collections = { 'case-studies': caseStudies, insights };
