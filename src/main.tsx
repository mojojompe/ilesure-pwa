import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './api/authContext';
import './index.css';

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
