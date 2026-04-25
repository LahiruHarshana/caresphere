const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type RequestOptions = {
  method?: string;
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          if (refreshResponse.ok) {
            const tokens = await refreshResponse.json();
            localStorage.setItem('token', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);

            // Retry the original request with new token
            const retryConfig = { ...config };
            (retryConfig.headers as any)['Authorization'] = `Bearer ${tokens.accessToken}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);

            if (retryResponse.ok) {
              // Handle 204 No Content for retry response
              if (retryResponse.status === 204) {
                return {} as T;
              }
              return retryResponse.json();
            }
          }
        } catch {
          // Refresh failed — force logout
        }

        // If refresh failed, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new ApiError(
      errorData.message || 'Request failed',
      response.status,
      errorData,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, token?: string | null) =>
    apiFetch<T>(endpoint, { token }),

  post: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'POST', body, token }),

  patch: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'PATCH', body, token }),

  put: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'PUT', body, token }),

  delete: <T = any>(endpoint: string, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'DELETE', token }),
};

export { ApiError };
export { API_BASE_URL };
