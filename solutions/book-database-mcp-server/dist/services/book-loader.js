// generated-by-copilot: Book data loading service
import { promises as fs } from 'fs';
import { BOOKS_FILE, BOOKS_DETAILS_FILE } from '../constants.js';
let booksCache = null;
let booksDetailsCache = null;
/**
 * Load books from books.json
 */
export async function loadBooks() {
    if (booksCache) {
        return booksCache;
    }
    try {
        const data = await fs.readFile(BOOKS_FILE, 'utf-8');
        booksCache = JSON.parse(data);
        return booksCache;
    }
    catch (error) {
        throw new Error(`Failed to load books: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Load book details from books-details.json
 */
export async function loadBookDetails() {
    if (booksDetailsCache) {
        return booksDetailsCache;
    }
    try {
        const data = await fs.readFile(BOOKS_DETAILS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        booksDetailsCache = parsed.books;
        return booksDetailsCache;
    }
    catch (error) {
        throw new Error(`Failed to load book details: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Combine basic book info with details
 */
export async function getCombinedBooks() {
    const [books, details] = await Promise.all([loadBooks(), loadBookDetails()]);
    const detailsMap = new Map(details.map((d) => [d.ISBN, d]));
    return books.map((book) => {
        const detail = detailsMap.get(book.ISBN);
        return {
            ...book,
            summary: detail?.summary,
            date: detail?.date,
        };
    });
}
/**
 * Search books by query (title, author, or ISBN)
 */
export async function searchBooks(query, limit, offset) {
    const books = await getCombinedBooks();
    const lowerQuery = query.toLowerCase();
    const filtered = books.filter((book) => book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.ISBN.includes(query));
    return filtered.slice(offset, offset + limit);
}
/**
 * Get total count of search results
 */
export async function searchBooksCount(query) {
    const books = await getCombinedBooks();
    const lowerQuery = query.toLowerCase();
    return books.filter((book) => book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.ISBN.includes(query)).length;
}
/**
 * Get book by ISBN
 */
export async function getBookByISBN(isbn) {
    const books = await getCombinedBooks();
    return books.find((book) => book.ISBN === isbn) || null;
}
/**
 * Get all books with pagination
 */
export async function getAllBooks(limit, offset) {
    const books = await getCombinedBooks();
    return books.slice(offset, offset + limit);
}
/**
 * Get total count of all books
 */
export async function getTotalBooksCount() {
    const books = await getCombinedBooks();
    return books.length;
}
/**
 * Get book by title (exact match)
 */
export async function getBookByTitle(title) {
    const books = await getCombinedBooks();
    return (books.find((book) => book.title.toLowerCase() === title.toLowerCase()) ||
        null);
}
/**
 * Get multiple books by array of titles (exact match)
 */
export async function getBooksByTitles(titles) {
    const books = await getCombinedBooks();
    const lowerTitles = titles.map((t) => t.toLowerCase());
    return books.filter((book) => lowerTitles.includes(book.title.toLowerCase()));
}
/**
 * Get multiple books by array of ISBNs
 */
export async function getBooksByISBNList(isbns) {
    const books = await getCombinedBooks();
    const isbnSet = new Set(isbns);
    return books.filter((book) => isbnSet.has(book.ISBN));
}
//# sourceMappingURL=book-loader.js.map