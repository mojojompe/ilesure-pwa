import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../api/authService';

/**
 * Landing point for Google sign-in (P-L1).
 *
 * The backend implements Google auth as a redirect flow, not a client-side token exchange:
 *
 *   GET {API}/auth/google/login?redirect=<this page>
 *     -> Google
 *     -> GET {API}/auth/google/callback
 *     -> 302 to <this page>?code=<single-use code>, traded for the session over POST
 *
 * The redirect used to carry the tokens themselves, which put credentials into browser
 * history and anywhere else URLs are recorded. It now carries a single-use code that expires
 * in two minutes and dies on first redemption, so a URL recovered from history later is spent.
 * The code is still stripped from the address bar via replaceState.
 */
export function GoogleCallback() {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  // StrictMode mounts effects twice in development; the tokens are single-use, so guard.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const serverError = params.get('error');

    // Strip the credentials from the URL before anything else, before any await, so they are
    // never left in the address bar or pushed into history.
    window.history.replaceState({}, document.title, window.location.pathname);

    if (serverError) {
      // The server redirected back with a reason rather than dropping the user on a bare page
      // at the API's origin. Translate its codes; anything unrecognised falls back.
      setError(
        serverError === 'password_account'
          ? 'This email is already registered with a password. Sign in with your email and password instead.'
          : 'Google sign-in did not complete. Please try again, or sign in with your email.'
      );
      return;
    }

    if (!code) {
      // No code and no reason: the user cancelled at Google, or the server declined to
      // redirect because this origin is not allowlisted (OAUTH_ALLOWED_ORIGINS) and answered
      // with JSON instead.
      setError('Google sign-in did not complete. Please try again, or sign in with your email.');
      return;
    }

    (async () => {
      try {
        // The redirect carries a single-use code, not a session. Trade it over POST.
        const result = await authService.exchangeGoogleCode(code);
        const user: any = result?.user;
        if (!result?.success || !user || !result.accessToken) {
          setError(
            result?.error?.code === 'INVALID_CODE'
              ? 'That sign-in link has expired or was already used. Please try again.'
              : result?.error?.message || 'We could not complete your sign-in. Please try again.'
          );
          return;
        }

        // Same gate the password path applies: this app is for renters. The server refuses
        // other roles during the callback, but a role could change between the two requests.
        // Gate before storing anything: a non-renter never gets a session written here.
        if (user.role !== 'student' && user.role !== 'individual') {
          setError('This app is for Students and Renters. Please use the iléSure Web App.');
          return;
        }

        setTokens(result.accessToken, result.refreshToken ?? null);
        setUser({ ...user, createdAt: user.createdAt || new Date().toISOString() });
        navigate('/', { replace: true });
      } catch {
        // Do not leave a half-established session behind.
        setTokens(null, null);
        setUser(null);
        setError('We could not complete your sign-in. Please try again.');
      }
    })();
    // Deliberately runs once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 text-center">
      {error ? (
        <>
          <p className="text-base font-semibold text-white mb-2">Sign-in failed</p>
          <p className="text-sm text-white/70 mb-6 max-w-xs leading-snug">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="rounded-[50px] bg-white px-6 py-3 text-sm font-bold text-primary"
          >
            Back to sign in
          </button>
        </>
      ) : (
        <>
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-sm text-white/80">Signing you in…</p>
        </>
      )}
    </div>
  );
}

export default GoogleCallback;
