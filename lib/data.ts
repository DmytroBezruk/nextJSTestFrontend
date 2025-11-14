import { apiClient } from './apiClient';
import {
  Author,
  Book,
  CreateAuthorPayload,
  CreateBookPayload,
  UpdateAuthorPayload,
  UpdateBookPayload,
  AnalyticsSummary,
  PaginatedAuthorList,
  PaginatedBookList,
} from './types';

// Authors
export const fetchAuthors = (page?: number) => apiClient.get<PaginatedAuthorList>(`/api/authors/${page ? `?page=${page}` : ''}`);
export const fetchAuthor = (id: number) => apiClient.get<Author>(`/api/authors/${id}/`);
export const createAuthor = (payload: CreateAuthorPayload) =>
  apiClient.post<Author, CreateAuthorPayload>('/api/authors/', payload);
export const updateAuthor = (id: number, payload: UpdateAuthorPayload) =>
  apiClient.put<Author, UpdateAuthorPayload>(`/api/authors/${id}/`, payload);
export const deleteAuthor = (id: number) => apiClient.delete<null>(`/api/authors/${id}/`);

// Books
export const fetchBooks = (page?: number) => apiClient.get<PaginatedBookList>(`/api/books/${page ? `?page=${page}` : ''}`);
export const fetchBook = (id: number) => apiClient.get<Book>(`/api/books/${id}/`);
export const createBook = (payload: CreateBookPayload) =>
  apiClient.post<Book, CreateBookPayload>('/api/books/', payload);
export const updateBook = (id: number, payload: UpdateBookPayload) =>
  apiClient.put<Book, UpdateBookPayload>(`/api/books/${id}/`, payload);
export const deleteBook = (id: number) => apiClient.delete<null>(`/api/books/${id}/`);

// Analytics
export const fetchAnalytics = () => apiClient.get<AnalyticsSummary>('/api/analytics/');
