// generated-by-copilot: Book search and retrieval tools for MCP server
import { BookSearchInputSchema, BookISBNInputSchema, ListBooksInputSchema, BookTitleInputSchema, BooksListInputSchema, BooksISBNListInputSchema, } from '../schemas/books.js';
import { searchBooks, searchBooksCount, getBookByISBN, getBookByTitle, getBooksByTitles, getBooksByISBNList, getAllBooks, getTotalBooksCount, } from '../services/book-loader.js';
/**
 * Register all book-related tools with the MCP server
 */
export function registerBookTools(server) {
    registerSearchBooksToolTool(server);
    registerGetBookByISBNTool(server);
    registerGetBookByTitleTool(server);
    registerGetBooksByTitlesTool(server);
    registerGetBooksByISBNListTool(server);
    registerListBooksTool(server);
}
/**
 * Tool: Search books by title, author, or ISBN
 */
function registerSearchBooksToolTool(server) {
    server.registerTool('search_books', {
        title: 'Search Books',
        description: `Search for books in the catalog by title, author, or ISBN.

This tool searches across all books in the catalog, supporting partial matches on titles and authors,
and exact matches on ISBN. It returns paginated results.

Args:
  - query (string): Search string to match against title, author, or ISBN
  - limit (number): Maximum results to return, between 1-100 (default: 20)
  - offset (number): Number of results to skip for pagination (default: 0)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For markdown format: Formatted list of books with details
  For JSON format: Structured data with book records and pagination info`,
        inputSchema: BookSearchInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async (params) => {
        try {
            const results = await searchBooks(params.query, params.limit, params.offset);
            const total = await searchBooksCount(params.query);
            if (results.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No books found matching query: "${params.query}"`,
                        },
                    ],
                };
            }
            if (params.response_format === 'json') {
                const output = {
                    query: params.query,
                    total,
                    count: results.length,
                    offset: params.offset,
                    has_more: total > params.offset + results.length,
                    next_offset: total > params.offset + results.length
                        ? params.offset + results.length
                        : null,
                    books: results,
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(output, null, 2),
                        },
                    ],
                    structuredContent: output,
                };
            }
            else {
                const lines = [
                    `# Book Search Results: "${params.query}"`,
                    '',
                    `Found ${total} books (showing ${results.length})`,
                    '',
                ];
                for (const book of results) {
                    lines.push(`## ${book.title}`);
                    lines.push(`- **ISBN**: ${book.ISBN}`);
                    lines.push(`- **Author**: ${book.author}`);
                    if (book.date) {
                        lines.push(`- **Published**: ${book.date}`);
                    }
                    if (book.summary) {
                        lines.push(`- **Summary**: ${book.summary.substring(0, 150)}...`);
                    }
                    lines.push('');
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: lines.join('\n'),
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    });
}
/**
 * Tool: Get detailed information about a book by ISBN
 */
function registerGetBookByISBNTool(server) {
    server.registerTool('get_book_by_isbn', {
        title: 'Get Book by ISBN',
        description: `Retrieve detailed information about a specific book using its ISBN.

This tool looks up a book by its ISBN and returns all available information including
title, author, publication date, and summary.

Args:
  - isbn (string): The ISBN of the book to retrieve
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For markdown format: Formatted book details
  For JSON format: Structured book data
  
Returns error message if book not found.`,
        inputSchema: BookISBNInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async (params) => {
        try {
            const book = await getBookByISBN(params.isbn);
            if (!book) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: Book with ISBN "${params.isbn}" not found.`,
                        },
                    ],
                };
            }
            if (params.response_format === 'json') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(book, null, 2),
                        },
                    ],
                    structuredContent: book,
                };
            }
            else {
                const lines = [
                    `# ${book.title}`,
                    '',
                    `**ISBN**: ${book.ISBN}`,
                    `**Author**: ${book.author}`,
                ];
                if (book.date) {
                    lines.push(`**Published**: ${book.date}`);
                }
                if (book.summary) {
                    lines.push('');
                    lines.push('## Summary');
                    lines.push(book.summary);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: lines.join('\n'),
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    });
}
/**
 * Tool: Get detailed information about a book by title
 */
function registerGetBookByTitleTool(server) {
    server.registerTool('get_book_by_title', {
        title: 'Get Book by Title',
        description: `Retrieve a book by its exact title.

This tool looks up a book by its exact title (case-insensitive) and returns
all available information including ISBN, author, publication date, and summary.

Args:
  - title (string): The exact title of the book to retrieve
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For markdown format: Formatted book details
  For JSON format: Structured book data
  
Returns error message if book not found.`,
        inputSchema: BookTitleInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async (params) => {
        try {
            const book = await getBookByTitle(params.title);
            if (!book) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: Book with title "${params.title}" not found. Use search_books to find books by partial title match.`,
                        },
                    ],
                };
            }
            if (params.response_format === 'json') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(book, null, 2),
                        },
                    ],
                    structuredContent: book,
                };
            }
            else {
                const lines = [
                    `# ${book.title}`,
                    '',
                    `**ISBN**: ${book.ISBN}`,
                    `**Author**: ${book.author}`,
                ];
                if (book.date) {
                    lines.push(`**Published**: ${book.date}`);
                }
                if (book.summary) {
                    lines.push('');
                    lines.push('## Summary');
                    lines.push(book.summary);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: lines.join('\n'),
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    });
}
/**
 * Tool: Get multiple books by array of titles
 */
function registerGetBooksByTitlesTool(server) {
    server.registerTool('get_books_by_titles', {
        title: 'Get Books by Titles',
        description: `Retrieve multiple books by their exact titles.

This tool looks up multiple books by their exact titles (case-insensitive) and returns
all available information for each matching book. Only books with exact title matches are returned.

Args:
  - titles (array): Array of book titles to retrieve (max 50)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For markdown format: Formatted list of book details
  For JSON format: Structured array of book data
  
Returns only matching books. If no books found, an empty result is returned.`,
        inputSchema: BooksListInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async (params) => {
        try {
            const books = await getBooksByTitles(params.titles);
            if (books.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No books found with the provided titles. Requested ${params.titles.length} titles: ${params.titles.map((t) => `"${t}"`).join(', ')}`,
                        },
                    ],
                };
            }
            if (params.response_format === 'json') {
                const output = {
                    requested: params.titles.length,
                    found: books.length,
                    books,
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(output, null, 2),
                        },
                    ],
                    structuredContent: output,
                };
            }
            else {
                const lines = [
                    `# Books by Titles`,
                    '',
                    `Found ${books.length} out of ${params.titles.length} requested books`,
                    '',
                ];
                for (const book of books) {
                    lines.push(`## ${book.title}`);
                    lines.push(`- **ISBN**: ${book.ISBN}`);
                    lines.push(`- **Author**: ${book.author}`);
                    if (book.date) {
                        lines.push(`- **Published**: ${book.date}`);
                    }
                    if (book.summary) {
                        lines.push(`- **Summary**: ${book.summary.substring(0, 150)}...`);
                    }
                    lines.push('');
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: lines.join('\n'),
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    });
}
/**
 * Tool: Get multiple books by array of ISBNs
 */
function registerGetBooksByISBNListTool(server) {
    server.registerTool('get_books_by_isbn_list', {
        title: 'Get Books by ISBN List',
        description: `Retrieve multiple books by their ISBNs.

This tool looks up multiple books by their ISBNs and returns all available information
for each matching book. Only books with valid ISBNs in the catalog are returned.

Args:
  - isbns (array): Array of ISBNs to retrieve (max 50)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For markdown format: Formatted list of book details
  For JSON format: Structured array of book data
  
Returns only matching books. If no books found, an empty result is returned.`,
        inputSchema: BooksISBNListInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async (params) => {
        try {
            const books = await getBooksByISBNList(params.isbns);
            if (books.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No books found with the provided ISBNs. Requested ${params.isbns.length} ISBNs: ${params.isbns.join(', ')}`,
                        },
                    ],
                };
            }
            if (params.response_format === 'json') {
                const output = {
                    requested: params.isbns.length,
                    found: books.length,
                    books,
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(output, null, 2),
                        },
                    ],
                    structuredContent: output,
                };
            }
            else {
                const lines = [
                    `# Books by ISBNs`,
                    '',
                    `Found ${books.length} out of ${params.isbns.length} requested ISBNs`,
                    '',
                ];
                for (const book of books) {
                    lines.push(`## ${book.title}`);
                    lines.push(`- **ISBN**: ${book.ISBN}`);
                    lines.push(`- **Author**: ${book.author}`);
                    if (book.date) {
                        lines.push(`- **Published**: ${book.date}`);
                    }
                    if (book.summary) {
                        lines.push(`- **Summary**: ${book.summary.substring(0, 150)}...`);
                    }
                    lines.push('');
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: lines.join('\n'),
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    });
}
/**
 * Tool: List all books with pagination
 */
function registerListBooksTool(server) {
    server.registerTool('list_books', {
        title: 'List All Books',
        description: `List all books in the catalog with pagination support.

This tool returns all books in the database with optional pagination.
Useful for browsing the catalog or getting a complete list.

Args:
  - limit (number): Maximum results to return, between 1-100 (default: 20)
  - offset (number): Number of results to skip for pagination (default: 0)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  For markdown format: Formatted list of books
  For JSON format: Structured data with book records and pagination info`,
        inputSchema: ListBooksInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async (params) => {
        try {
            const books = await getAllBooks(params.limit, params.offset);
            const total = await getTotalBooksCount();
            if (params.response_format === 'json') {
                const output = {
                    total,
                    count: books.length,
                    offset: params.offset,
                    has_more: total > params.offset + books.length,
                    next_offset: total > params.offset + books.length
                        ? params.offset + books.length
                        : null,
                    books,
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(output, null, 2),
                        },
                    ],
                    structuredContent: output,
                };
            }
            else {
                const lines = [
                    `# All Books in Catalog`,
                    '',
                    `Total books: ${total} (showing ${books.length})`,
                    '',
                ];
                for (const book of books) {
                    lines.push(`## ${book.title}`);
                    lines.push(`- **ISBN**: ${book.ISBN}`);
                    lines.push(`- **Author**: ${book.author}`);
                    if (book.date) {
                        lines.push(`- **Published**: ${book.date}`);
                    }
                    lines.push('');
                }
                if (total > params.offset + books.length) {
                    lines.push(`_More results available. Use offset=${params.offset + params.limit} to fetch next page._`);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: lines.join('\n'),
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    });
}
//# sourceMappingURL=books-tools.js.map