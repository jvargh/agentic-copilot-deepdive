import type { Book, BookDetail, BookRecord } from '../types.js';
/**
 * Load books from books.json
 */
export declare function loadBooks(): Promise<Book[]>;
/**
 * Load book details from books-details.json
 */
export declare function loadBookDetails(): Promise<BookDetail[]>;
/**
 * Combine basic book info with details
 */
export declare function getCombinedBooks(): Promise<BookRecord[]>;
/**
 * Search books by query (title, author, or ISBN)
 */
export declare function searchBooks(query: string, limit: number, offset: number): Promise<BookRecord[]>;
/**
 * Get total count of search results
 */
export declare function searchBooksCount(query: string): Promise<number>;
/**
 * Get book by ISBN
 */
export declare function getBookByISBN(isbn: string): Promise<BookRecord | null>;
/**
 * Get all books with pagination
 */
export declare function getAllBooks(limit: number, offset: number): Promise<BookRecord[]>;
/**
 * Get total count of all books
 */
export declare function getTotalBooksCount(): Promise<number>;
/**
 * Get book by title (exact match)
 */
export declare function getBookByTitle(title: string): Promise<BookRecord | null>;
/**
 * Get multiple books by array of titles (exact match)
 */
export declare function getBooksByTitles(titles: string[]): Promise<BookRecord[]>;
/**
 * Get multiple books by array of ISBNs
 */
export declare function getBooksByISBNList(isbns: string[]): Promise<BookRecord[]>;
//# sourceMappingURL=book-loader.d.ts.map