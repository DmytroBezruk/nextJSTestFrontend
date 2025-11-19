import { apiClient } from './apiClient';

export interface TokenPair {
  access: string;
  refresh: string;
}

// User object shape (as per OpenAPI spec) in case backend returns it along with tokens.
export interface RegisteredUser {
  id?: number;
  name: string;
  email: string;
  access?: string; // Some backends include tokens directly on the response
  refresh?: string;
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const data = await apiClient.post<TokenPair>('/api/login/', { email, password });
  // Save tokens — for simplicity, use localStorage (you can replace with cookies)
  localStorage.setItem('access', data.access);
  localStorage.setItem('refresh', data.refresh);
  return data;
}

/**
 * Register a new user and obtain tokens.
 * Backend (per your note) returns access & refresh tokens from /api/register/.
 * Fallback: if tokens are not present on the response, perform a login immediately after.
 */
export async function register(name: string, email: string, password: string): Promise<TokenPair & { user?: RegisteredUser }> {
  const payload = { name, email, password };

  // We use a broad type since backend may return user fields + tokens.
  const response = await apiClient.post<RegisteredUser | (RegisteredUser & TokenPair)>('/api/register/', payload);

  // Attempt to extract tokens directly.
  let access = (response as any).access;
  let refresh = (response as any).refresh;

  if (!access || !refresh) {
    // Fallback to explicit login if register did not include tokens.
    const tokens = await login(email, password);
    access = tokens.access;
    refresh = tokens.refresh;
  } else {
    // Persist tokens from register response.
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
  }

  return { access, refresh, user: response };
}

export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  // Optionally: call /api/logout/ endpoint if backend expects it.
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access');
}
