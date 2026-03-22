// generated-by-copilot: Zod schemas for book database MCP server

import { z } from 'zod';

export const BookSearchInputSchema = z
  .object({
    query: z
      .string()
      .min(1, 'Query must be at least 1 character')
      .max(200, 'Query must not exceed 200 characters')
      .describe('Search string to match against title, author, or ISBN'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe('Maximum results to return'),
    offset: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe('Number of results to skip for pagination'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "Output format: 'markdown' for human-readable or 'json' for machine-readable"
      ),
  })
  .strict();

export type BookSearchInput = z.infer<typeof BookSearchInputSchema>;

export const BookISBNInputSchema = z
  .object({
    isbn: z
      .string()
      .min(10, 'ISBN must be at least 10 characters')
      .max(20, 'ISBN must not exceed 20 characters')
      .describe('ISBN of the book to retrieve'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "Output format: 'markdown' for human-readable or 'json' for machine-readable"
      ),
  })
  .strict();

export type BookISBNInput = z.infer<typeof BookISBNInputSchema>;

export const ListBooksInputSchema = z
  .object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe('Maximum results to return'),
    offset: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe('Number of results to skip for pagination'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "Output format: 'markdown' for human-readable or 'json' for machine-readable"
      ),
  })
  .strict();

export type ListBooksInput = z.infer<typeof ListBooksInputSchema>;

export const BookTitleInputSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title must be at least 1 character')
      .max(500, 'Title must not exceed 500 characters')
      .describe('Title of the book to retrieve'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "Output format: 'markdown' for human-readable or 'json' for machine-readable"
      ),
  })
  .strict();

export type BookTitleInput = z.infer<typeof BookTitleInputSchema>;

export const BooksListInputSchema = z
  .object({
    titles: z
      .array(z.string().min(1).max(500))
      .min(1, 'At least one title is required')
      .max(50, 'Maximum 50 titles allowed')
      .describe('Array of book titles to retrieve'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "Output format: 'markdown' for human-readable or 'json' for machine-readable"
      ),
  })
  .strict();

export type BooksListInput = z.infer<typeof BooksListInputSchema>;

export const BooksISBNListInputSchema = z
  .object({
    isbns: z
      .array(z.string().min(10).max(20))
      .min(1, 'At least one ISBN is required')
      .max(50, 'Maximum 50 ISBNs allowed')
      .describe('Array of ISBNs to retrieve'),
    response_format: z
      .enum(['markdown', 'json'])
      .default('markdown')
      .describe(
        "Output format: 'markdown' for human-readable or 'json' for machine-readable"
      ),
  })
  .strict();

export type BooksISBNListInput = z.infer<typeof BooksISBNListInputSchema>;
