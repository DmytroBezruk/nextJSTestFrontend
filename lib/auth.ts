import { apiClient } from './apiClient';

export interface TokenPair {
  access: string;
  refresh: string;
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const data = await apiClient.post<TokenPair>('/auth/login/', { username, password });
  // Save tokens — for simplicity, use localStorage (you can replace with cookies)
  localStorage.setItem('access', data.access);
  localStorage.setItem('refresh', data.refresh);
  return data;
}

export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access');
}
