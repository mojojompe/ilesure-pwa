import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './api/authContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Do not refetch when window gains focus
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 15, // Keep unused data in cache for 15 minutes
    },
  },
});

// SECURITY-FIX (P-L1): require a real Google OAuth client ID from env. The previous
// dummy fallback ('dummy_client_id.apps.googleusercontent.com') made "Sign in with
// Google" look functional while it could never work, masking a broken/misconfigured
// integration. Fail loud instead of silently shipping the dummy.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
if (!GOOGLE_CLIENT_ID) {
  console.error(
    '[Config] VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In is disabled until a real client ID is provided.'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
