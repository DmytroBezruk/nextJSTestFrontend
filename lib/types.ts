export interface Author {
  id: number;
  name: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  name: string;
  content: string;
  author: Author; // readOnly nested author
  author_id?: number; // writeOnly when creating/updating
  created_at: string;
  updated_at: string;
}

export interface CreateBookPayload {
  name: string;
  content: string;
  author_id: number;
}

export interface UpdateBookPayload {
  name?: string;
  content?: string;
  author_id?: number;
}

export interface CreateAuthorPayload {
  name: string;
  details?: string;
}

export interface UpdateAuthorPayload {
  name?: string;
  details?: string;
}

export interface AnalyticsBucket {
  label: string;
  books: number;
  authors: number;
}

export interface AnalyticsSummary {
  totalBooks: number;
  totalAuthors: number;
  newBooksLast30: number;
  newAuthorsLast30: number;
  booksGrowthPct: number;
  authorsGrowthPct: number;
  buckets: AnalyticsBucket[];
}

export interface PaginatedAuthorList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Author[];
}

export interface PaginatedBookList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}
