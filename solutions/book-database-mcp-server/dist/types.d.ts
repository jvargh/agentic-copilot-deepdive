/**
 * Represents basic book information from books.json
 */
export interface Book {
    ISBN: string;
    title: string;
    author: string;
}
/**
 * Represents detailed book information from books-details.json
 */
export interface BookDetail {
    ISBN: string;
    summary: string;
    date: string;
    author: string;
}
/**
 * Combined book record with both basic and detailed information
 */
export interface BookRecord extends Book {
    summary?: string;
    date?: string;
}
/**
 * Pagination response metadata
 */
export interface PaginationMetadata {
    total: number;
    count: number;
    offset: number;
    has_more: boolean;
    next_offset?: number;
}
/**
 * Search results with pagination
 */
export interface SearchResults {
    books: BookRecord[];
    pagination: PaginationMetadata;
}
//# sourceMappingURL=types.d.ts.map