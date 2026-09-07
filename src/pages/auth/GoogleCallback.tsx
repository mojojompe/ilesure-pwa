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
 *     -> 302 to <this page>?accessToken=...&refreshToken=...
 *
 * SECURITY NOTE — not fixed here, and worth fixing: the server delivers the session in the
 * QUERY STRING. `authController.googleCallback` carries its own TODO saying as much ("replace
 * token-in-URL delivery with a one-time code exchanged over POST (PKCE)"). A token in a URL is
 * written to browser history, and can reach referrer headers and any intermediary that logs
 * URLs. Changing that is a backend change and a protocol change for every client.
 *
 * What this page can do — and does, first thing — is stop the tokens persisting in the address
 * bar and in history, via replaceState. That narrows the exposure; it does not remove it.
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
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    // Strip the credentials from the URL before anything else — before any await, so they are
    // never left in the address bar or pushed into history.
    window.history.replaceState({}, document.title, window.location.pathname);

    if (!accessToken || !refreshToken) {
      // Reached without tokens: the user cancelled at Google, or the server declined to
      // redirect because this origin is not in its allowlist (OAUTH_ALLOWED_ORIGINS).
      setError('Google sign-in did not complete. Please try again, or sign in with your email.');
      return;
    }

    (async () => {
      try {
        setTokens(accessToken, refreshToken);

        // The redirect carries no profile, so ask for it with the session we were just given.
        const profile = await authService.getProfile();
        const user: any = profile?.data;
        if (!profile?.success || !user) throw new Error('profile unavailable');

        // Same gate the password path applies: this app is for renters. The server refuses
        // other roles during the callback, but a role could change between the two requests.
        if (user.role !== 'student' && user.role !== 'individual') {
          setTokens(null, null);
          setUser(null);
          setError('This app is for Students and Renters. Please use the iléSure Web App.');
          return;
        }

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
