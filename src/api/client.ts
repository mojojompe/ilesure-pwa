import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import API_BASE_URL from './config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      // SECURITY-FIX: send credentials so the backend-set httpOnly refresh-token cookie
      // is included on requests (notably /auth/refresh). The refresh token is no longer
      // read from JS-accessible storage — the cookie is the source of truth.
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.handleRefreshToken();
            if (refreshed) {
              const token = this.getToken();
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }

          this.clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        if (error.response?.status === 403) {
          const message = error.response?.data?.error?.message || 'Access denied';
          if (message.toLowerCase().includes('suspend')) {
            this.clearTokens();
            window.location.href = '/suspended';
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    try {
      const authData = localStorage.getItem('ilesure_pwa_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || parsed.accessToken || null; // Handling Zustand persist format or raw
      }
      return null;
    } catch {
      return null;
    }
  }

  private async handleRefreshToken(): Promise<boolean> {
    try {
      // SECURITY-FIX: the refresh token is delivered as an httpOnly cookie set by the
      // backend and is NO LONGER persisted in / read from localStorage. With
      // `withCredentials`, the cookie is sent automatically to /auth/refresh. We keep a
      // transitional body fallback only if a refreshToken happens to still be in the
      // in-memory store, but we never persist a (new) refresh token to localStorage.
      const authData = localStorage.getItem('ilesure_pwa_auth');
      const parsed = authData ? JSON.parse(authData) : null;
      const state = parsed?.state || parsed || {};
      const refreshToken = state.refreshToken; // usually undefined now (cookie is truth)

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        refreshToken ? { refreshToken } : {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;

      if (accessToken) {
        // Only the (short-lived) access token is patched back into storage.
        if (parsed?.state) {
          parsed.state.token = accessToken;
          localStorage.setItem('ilesure_pwa_auth', JSON.stringify(parsed));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private clearTokens(): void {
    localStorage.removeItem('ilesure_pwa_auth');
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
