import { apiClient } from './apiClient';
import {
  Author,
  Book,
  CreateAuthorPayload,
  CreateBookPayload,
  UpdateAuthorPayload,
  UpdateBookPayload,
  AnalyticsSummary,
} from './types';

// Authors
export const fetchAuthors = () => apiClient.get<Author[]>('/api/authors/');
export const fetchAuthor = (id: number) => apiClient.get<Author>(`/api/authors/${id}/`);
export const createAuthor = (payload: CreateAuthorPayload) =>
  apiClient.post<Author, CreateAuthorPayload>('/api/authors/', payload);
export const updateAuthor = (id: number, payload: UpdateAuthorPayload) =>
  apiClient.put<Author, UpdateAuthorPayload>(`/api/authors/${id}/`, payload);
export const deleteAuthor = (id: number) => apiClient.delete<null>(`/api/authors/${id}/`);

// Books
export const fetchBooks = () => apiClient.get<Book[]>('/api/books/');
export const fetchBook = (id: number) => apiClient.get<Book>(`/api/books/${id}/`);
export const createBook = (payload: CreateBookPayload) =>
  apiClient.post<Book, CreateBookPayload>('/api/books/', payload);
export const updateBook = (id: number, payload: UpdateBookPayload) =>
  apiClient.put<Book, UpdateBookPayload>(`/api/books/${id}/`, payload);
export const deleteBook = (id: number) => apiClient.delete<null>(`/api/books/${id}/`);

// Analytics
export const fetchAnalytics = () => apiClient.get<AnalyticsSummary>('/api/analytics/');
