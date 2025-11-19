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
export const fetchAllAuthors = () => apiClient.get<Author[]>('/api/authors/all/');
export const fetchAuthors = (page?: number) => apiClient.get<PaginatedAuthorList>(`/api/authors/${page ? `?page=${page}` : ''}`);
export const fetchAuthor = (id: number) => apiClient.get<Author>(`/api/authors/${id}/`);
export const createAuthor = (payload: CreateAuthorPayload) => {
  const form = new FormData();
  form.append('name', payload.name);
  if (payload.details) form.append('details', payload.details);
  if (payload.image) form.append('image', payload.image);
  return apiClient.post<Author, FormData>('/api/authors/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateAuthor = (id: number, payload: UpdateAuthorPayload) => {
  const form = new FormData();
  if (payload.name !== undefined) form.append('name', payload.name);
  if (payload.details !== undefined) form.append('details', payload.details);
  if (payload.image) form.append('image', payload.image);
  return apiClient.put<Author, FormData>(`/api/authors/${id}/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteAuthor = (id: number) => apiClient.delete<null>(`/api/authors/${id}/`);

// Books
export const fetchBooks = (page?: number) => apiClient.get<PaginatedBookList>(`/api/books/${page ? `?page=${page}` : ''}`);
export const fetchBook = (id: number) => apiClient.get<Book>(`/api/books/${id}/`);
export const createBook = (payload: CreateBookPayload) => {
  const form = new FormData();
  form.append('name', payload.name);
  form.append('content', payload.content);
  form.append('author_id', String(payload.author_id));
  if (payload.image) form.append('image', payload.image);
  return apiClient.post<Book, FormData>('/api/books/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateBook = (id: number, payload: UpdateBookPayload) => {
  const form = new FormData();
  if (payload.name !== undefined) form.append('name', payload.name);
  if (payload.content !== undefined) form.append('content', payload.content);
  if (payload.author_id !== undefined) form.append('author_id', String(payload.author_id));
  if (payload.image) form.append('image', payload.image);
  return apiClient.put<Book, FormData>(`/api/books/${id}/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteBook = (id: number) => apiClient.delete<null>(`/api/books/${id}/`);

// Analytics
export const fetchAnalytics = () => apiClient.get<AnalyticsSummary>('/api/analytics/');
