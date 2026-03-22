# Book Database MCP Server

A Model Context Protocol (MCP) server that provides tools to search and retrieve information from a local book catalog database.

## Features

- Search books by title, author, or ISBN
- Get detailed book information including publication date and summary
- List all books with pagination support
- Retrieve book details by ISBN

## Project Structure

```
book-database-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts           # Main entry point with McpServer initialization
│   ├── types.ts           # TypeScript type definitions
│   ├── constants.ts       # Shared constants
│   ├── data/              # Book catalog data files
│   │   ├── books.json     # Basic book information
│   │   └── books-details.json  # Detailed book information
│   ├── schemas/           # Zod validation schemas
│   │   └── books.ts       # Book-related schemas
│   ├── tools/             # Tool implementations
│   │   └── books-tools.ts # Book search and retrieval tools
│   └── services/          # Shared utilities
│       └── book-loader.ts # Book data loading service
└── dist/                  # Compiled JavaScript output
```

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Running

```bash
npm start
```

The server uses stdio transport and will listen on standard input/output.

## Available Tools

### search_books

Search for books by title, author, or ISBN with pagination support.

### get_book_by_isbn

Retrieve detailed information about a specific book using its ISBN.

### list_books

List all books in the catalog with support for limiting and offset pagination.

## Development

To run with auto-reload during development:

```bash
npm run dev
```

## Data Files

- **books.json**: Contains basic book information (ISBN, title, author)
- **books-details.json**: Contains extended information (ISBN, summary, publication date, author)
