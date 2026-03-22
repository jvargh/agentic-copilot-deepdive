// generated-by-copilot: Constants for the book database MCP server

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve data directory relative to compiled dist/ folder
export const DATA_DIR = join(__dirname, '..', 'src', 'data');
export const BOOKS_FILE = join(DATA_DIR, 'books.json');
export const BOOKS_DETAILS_FILE = join(DATA_DIR, 'books-details.json');

export const CHARACTER_LIMIT = 25000;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
