import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

/**
 * Custom error wrapper to normalize API errors.
 */
export class ApiClientError extends Error {
  status?: number;
  data?: unknown;
  // Preserve original error if needed.
  cause?: unknown;

  constructor(
    message: string,
    options?: { status?: number; data?: unknown; cause?: unknown }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = options?.status;
    this.data = options?.data;
    this.cause = options?.cause;
  }
}

// Read the public API base URL from environment variables.
// NEXT_PUBLIC_ prefix makes it available to client & server in Next.js.
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  // Failing fast helps catch misconfiguration early (during build or startup).
  throw new Error(
    'Missing environment variable NEXT_PUBLIC_API_URL. Set it in .env.local.'
  );
}

/**
 * Shared Axios instance configured with sane defaults.
 * Adjust timeouts / headers as needed.
 */
const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // You can add withCredentials: true if using cookie auth across domains.
});

// Request interceptor (add auth tokens, correlation IDs, etc.)
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for unified error handling.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If token expired (SimpleJWT standard error message)
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      (error.response.data as any).code === 'token_not_valid' &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        console.warn('No refresh token available');
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${baseURL}/api/token/refresh/`, {
          refresh,
        });

        // Save new tokens
        localStorage.setItem('access', data.access);
        if (data.refresh) localStorage.setItem('refresh', data.refresh);

        // Retry the original request with the new access token
        if (originalRequest?.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        }

        return api(originalRequest!);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Otherwise, propagate the error with DRF-friendly message
    const extractDRFMessage = (data: unknown): string => {
      if (!data || typeof data !== 'object') return '';
      if ('non_field_errors' in data && Array.isArray((data as any).non_field_errors)) {
        return (data as any).non_field_errors.join(' ');
      }
      const fieldMessages = Object.entries(data as Record<string, unknown>)
        .map(([key, value]) => {
          if (Array.isArray(value)) return value.join(' ');
          if (typeof value === 'string') return value;
          return '';
        })
        .filter(Boolean)
        .join(' ');
      if (fieldMessages) return fieldMessages;
      if ('detail' in data && typeof (data as any).detail === 'string') return (data as any).detail;
      return '';
    };

    if (error.response) {
      const { status, data } = error.response;
      const message = extractDRFMessage(data) || error.message || 'Request failed.';
      return Promise.reject(new ApiClientError(message, { status, data, cause: error }));
    }

    if (error.request) {
      return Promise.reject(new ApiClientError('No response received from server.', { cause: error }));
    }

    return Promise.reject(new ApiClientError(error.message || 'Unexpected error.', { cause: error }));
  }
);



export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Generic request helper with full typing.
 */
async function request<TReturn = unknown, TBody = unknown>(
  method: HttpMethod,
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig
): Promise<TReturn> {
  const finalConfig: AxiosRequestConfig = {
    ...config,
    method,
    url,
  };

  if (body !== undefined) {
    finalConfig.data = body;
  }

  const response: AxiosResponse<TReturn> = await api.request<TReturn>(
    finalConfig
  );
  return response.data;
}

/**
 * Convenience strongly-typed verb helpers.
 */
const apiClient = {
  request,
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>('get', url, undefined, config),
  post: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ) => request<T, B>('post', url, body, config),
  put: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ) => request<T, B>('put', url, body, config),
  patch: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ) => request<T, B>('patch', url, body, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>('delete', url, undefined, config),
  /** Direct access to underlying Axios instance for advanced use-cases. */
  instance: api,
  /** Base URL used for all requests */
  baseURL,
};

export { apiClient };

/**
 * Small helper tailored for @tanstack/react-query usage.
 *
 * Example:
 * const userQuery = useQuery({
 *   queryKey: ['user', id],
 *   queryFn: createQueryFetcher<User>(`/users/${id}`),
 * });
 */
export function createQueryFetcher<TData = unknown>(
  url: string,
  config?: AxiosRequestConfig
): () => Promise<TData> {
  return () => apiClient.get<TData>(url, config);
}

/**
 * Mutation helper for React Query (optional convenience).
 *
 * const mutation = useMutation({
 *   mutationFn: createMutationFetcher<User, Partial<User>>('/users'),
 * });
 */
export function createMutationFetcher<TReturn = unknown, TBody = unknown>(
  url: string,
  method: Extract<HttpMethod, 'post' | 'put' | 'patch' | 'delete'>,
  config?: AxiosRequestConfig
): (body?: TBody) => Promise<TReturn> {
  return (body?: TBody) => apiClient.request<TReturn, TBody>(method, url, body, config);
}

/**
 * Narrow generic for paginated responses (example pattern).
 */
export interface PaginatedResponse<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Example specialized fetcher for pagination endpoints.
 * const fetchUsers = (page: number) =>
 *   apiClient.get<PaginatedResponse<User>>(`/users?page=${page}`);
 */
export type { AxiosRequestConfig };
