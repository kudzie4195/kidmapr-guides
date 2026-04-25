import { defineCollection, z } from 'astro:content';

/**
 * Guide content collection schema.
 *
 * Content lives at src/content/guides/[state]/[slug].mdx
 * Built URL: /guides/[state]/[slug]
 *
 * Adding a new state = create a new folder, drop in MDX files.
 * No new routes, no new React components, no new App.jsx entries.
 */
const guides = defineCollection({
  type: 'content',
  schema: z.object({
    // Core
    title:       z.string(),
    description: z.string(),
    state:       z.string(),          // 'georgia', 'north-carolina', etc.
    stateLabel:  z.string(),          // 'Georgia', 'North Carolina'

    // Categorization
    category: z.enum([
      'childcare',      // 0–5 parent guides
      'k-transition',   // Pre-K → K, school choice
      'financial',      // CAPS, GOAL, tax credits
      'provider',       // Provider-facing guides
    ]),
    audience: z.enum(['parents', 'providers']).default('parents'),

    // Display
    icon:         z.string(),          // emoji
    timeEstimate: z.string(),          // '15 min read'
    stepCount:    z.number().optional(),
    isFree:       z.boolean().default(true),
    priceCents:   z.number().optional(),

    // SEO & freshness
    lastUpdated:  z.string(),          // ISO date 'YYYY-MM-DD'
    ogImage:      z.string().optional(), // path relative to /public

    // Related content
    relatedGuides: z.array(z.string()).optional(), // slugs e.g. ['georgia/goal-scholarship']

    // Schema.org structured data — injected server-side at build time
    faq: z.array(z.object({
      question: z.string(),
      answer:   z.string(),
    })).optional(),

    howToSteps: z.array(z.object({
      name: z.string(),
      text: z.string(),
    })).optional(),

    // Internal — do not render
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };
