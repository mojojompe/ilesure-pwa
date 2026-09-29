import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import API_BASE_URL from './config';
import { useAuthStore } from '../stores/authStore';

/**
 * - `refreshed`: a new access token is stored.
 * - `failed`: the refresh was refused; the session has been ended.
 * - `suspended`: the account is suspended; the session has been ended.
 * - `unavailable`: no response (offline); the session is kept.
 */
export type RefreshOutcome = 'refreshed' | 'failed' | 'suspended' | 'unavailable';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Suspension is identified by the backend's error code. The message match is a
 * fallback only for a response that carries no code at all.
 */
export function isAccountSuspendedError(error: unknown): boolean {
  const body = axios.isAxiosError(error) ? (error.response?.data as any) : undefined;
  const code = body?.error?.code;
  if (code) return code === 'ACCOUNT_SUSPENDED';
  const message = body?.error?.message;
  return typeof message === 'string' && message.toLowerCase().includes('suspend');
}

/** The bearer token a request was sent with, if any. */
function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.Authorization ?? config.headers?.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length);
}

/**
 * Runs `fn` under a cross-tab Web Lock where supported, so two tabs sharing the
 * refresh cookie never present it concurrently.
 */
function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (locks?.request) {
    return locks.request('ilesure-pwa-token-refresh', fn) as Promise<T>;
  }
  return fn();
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<RefreshOutcome> | null = null;
  private tokenListeners = new Set<(token: string) => void>();

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
        const originalRequest = error.config as RetriableRequest | undefined;
        const status = error.response?.status;

        // `_retry` marks a request that has already been replayed once after a
        // refresh. A second 401 on it is final, never another refresh: that is
        // what stops a request from looping.
        if (status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          // A 401 on a request made with no token means "not signed in yet",
          // not "session expired". There is nothing to refresh and nowhere to
          // send them — they are already on a public screen. Attempting the
          // redirect here is what made the sign-in page reload in a loop:
          // /calls/ice fired on mount, 401'd, and the handler navigated to
          // /login while already on /login, which is a full page reload.
          const currentToken = this.getToken();
          if (!currentToken) {
            return Promise.reject(error);
          }

          // If the token this request carried is no longer the stored one, a
          // refresh already finished while it was in flight. Replay with the
          // current token instead of spending the refresh cookie again.
          const sentToken = bearerOf(originalRequest);
          let token: string | null = null;
          if (sentToken && sentToken !== currentToken) {
            token = currentToken;
          } else if ((await this.refreshSession()) === 'refreshed') {
            token = this.getToken();
          }

          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client.request(originalRequest);
          }
          return Promise.reject(error);
        }

        if (status === 403 && isAccountSuspendedError(error)) {
          this.endSession('suspended');
        }

        return Promise.reject(error);
      }
    );
  }

  /** The access token currently in storage (read fresh on every call). */
  getAccessToken(): string | null {
    return this.getToken();
  }

  /**
   * Subscribe to access-token changes produced by a refresh (in this tab or
   * another). Returns an unsubscribe function.
   */
  onAccessTokenRefreshed(listener: (token: string) => void): () => void {
    this.tokenListeners.add(listener);
    return () => { this.tokenListeners.delete(listener); };
  }

  /**
   * Single-flight session refresh.
   *
   * The backend rotates refresh tokens and treats a second use of an already
   * rotated one as token REUSE, revoking every session the user has. Two
   * parallel 401s each firing their own /auth/refresh therefore logged the user
   * out on every device. Every caller now awaits the one in-flight refresh, and
   * a Web Lock serialises refreshes across tabs (which share the cookie).
   *
   * On failure the session is ended exactly once, here, rather than once per
   * waiting request. A network failure (no response) keeps the session: being
   * offline is not a reason to sign someone out.
   */
  refreshSession(): Promise<RefreshOutcome> {
    if (this.refreshPromise) return this.refreshPromise;

    const staleToken = this.getToken();
    this.refreshPromise = withRefreshLock(async (): Promise<RefreshOutcome> => {
      // Another tab may have refreshed while this one waited for the lock.
      const current = this.getToken();
      if (current && current !== staleToken) return 'refreshed';
      return this.performRefresh();
    })
      .then((outcome) => {
        if (outcome === 'refreshed') {
          const token = this.getToken();
          if (token) this.applyRefreshedToken(token);
        } else if (outcome === 'failed' || outcome === 'suspended') {
          this.endSession(outcome);
        }
        return outcome;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
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

  /**
   * Sends an expired session back to sign-in without ever reloading the page.
   *
   * `window.location.href = '/login'` is a full page load, and when the user is
   * already on an auth screen it is a reload — which, paired with a request
   * that 401s on mount, loops forever. Public auth routes are left alone.
   */
  private redirectToLogin(): void {
    const path = window.location.pathname;
    const isOnAuthScreen = path === '/login'
      || path === '/register'
      || path.startsWith('/auth');
    if (isOnAuthScreen) return;

    window.location.assign('/login');
  }

  private async performRefresh(): Promise<RefreshOutcome> {
    try {
      // SECURITY-FIX: the refresh token is delivered as an httpOnly cookie set by the
      // backend and is NO LONGER persisted in / read from localStorage. With
      // `withCredentials`, the cookie is sent automatically to /auth/refresh. We keep a
      // transitional body fallback only if a refreshToken happens to still be in the
      // in-memory store, but we never persist a (new) refresh token to localStorage.
      const refreshToken = useAuthStore.getState().refreshToken; // usually null now (cookie is truth)

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        refreshToken ? { refreshToken } : {},
        { withCredentials: true }
      );
      const payload = response.data?.data ?? response.data;
      const accessToken: string | undefined = payload?.accessToken;
      if (!accessToken) return 'failed';

      // Only the (short-lived) access token is stored. Going through the store
      // (not a raw localStorage patch) keeps the in-memory copy in step, so the
      // next persisted write does not put the stale token back.
      useAuthStore.setState({ token: accessToken });
      return 'refreshed';
    } catch (err) {
      if (isAccountSuspendedError(err)) return 'suspended';
      if (axios.isAxiosError(err) && !err.response) return 'unavailable';
      return 'failed';
    }
  }

  private applyRefreshedToken(token: string): void {
    if (useAuthStore.getState().token !== token) {
      useAuthStore.setState({ token });
    }
    this.tokenListeners.forEach((listener) => {
      try { listener(token); } catch { /* a listener must not break the refresh */ }
    });
  }

  /** Clears the session and sends the user to sign-in (with the reason when suspended). */
  private endSession(reason: 'failed' | 'suspended'): void {
    this.clearTokens();
    if (reason === 'suspended') {
      if (window.location.pathname === '/login' && window.location.search.includes('reason=suspended')) return;
      window.location.assign('/login?reason=suspended');
      return;
    }
    this.redirectToLogin();
  }

  private clearTokens(): void {
    useAuthStore.getState().clearAuth();
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
