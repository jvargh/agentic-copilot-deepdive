import { z } from 'zod';
export declare const BookSearchInputSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    query: string;
    limit: number;
    offset: number;
    response_format: "markdown" | "json";
}, {
    query: string;
    limit?: number | undefined;
    offset?: number | undefined;
    response_format?: "markdown" | "json" | undefined;
}>;
export type BookSearchInput = z.infer<typeof BookSearchInputSchema>;
export declare const BookISBNInputSchema: z.ZodObject<{
    isbn: z.ZodString;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    isbn: string;
}, {
    isbn: string;
    response_format?: "markdown" | "json" | undefined;
}>;
export type BookISBNInput = z.infer<typeof BookISBNInputSchema>;
export declare const ListBooksInputSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    offset: number;
    response_format: "markdown" | "json";
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    response_format?: "markdown" | "json" | undefined;
}>;
export type ListBooksInput = z.infer<typeof ListBooksInputSchema>;
export declare const BookTitleInputSchema: z.ZodObject<{
    title: z.ZodString;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    title: string;
}, {
    title: string;
    response_format?: "markdown" | "json" | undefined;
}>;
export type BookTitleInput = z.infer<typeof BookTitleInputSchema>;
export declare const BooksListInputSchema: z.ZodObject<{
    titles: z.ZodArray<z.ZodString, "many">;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    titles: string[];
}, {
    titles: string[];
    response_format?: "markdown" | "json" | undefined;
}>;
export type BooksListInput = z.infer<typeof BooksListInputSchema>;
export declare const BooksISBNListInputSchema: z.ZodObject<{
    isbns: z.ZodArray<z.ZodString, "many">;
    response_format: z.ZodDefault<z.ZodEnum<["markdown", "json"]>>;
}, "strict", z.ZodTypeAny, {
    response_format: "markdown" | "json";
    isbns: string[];
}, {
    isbns: string[];
    response_format?: "markdown" | "json" | undefined;
}>;
export type BooksISBNListInput = z.infer<typeof BooksISBNListInputSchema>;
//# sourceMappingURL=books.d.ts.map