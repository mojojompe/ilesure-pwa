import { createContext, useContext, type ReactNode } from 'react';
import { useCallEngine } from '../hooks/useCallEngine';
import { useAuthStore } from '../stores/authStore';

/**
 * Call state lives above the router, not inside the chat screen.
 *
 * Two reasons: a call has to survive the user navigating away from the conversation, and
 * an incoming call has to be presentable from wherever they happen to be in the app.
 */

type CallContextValue = ReturnType<typeof useCallEngine>;

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  // The provider sits above the router, so it also wraps the public auth
  // screens. Calling is meaningless there and its ICE request 401s, so the
  // engine stays dormant until there is a session.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const engine = useCallEngine(isAuthenticated);
  return <CallContext.Provider value={engine}>{children}</CallContext.Provider>;
}

export function useCall(): CallContextValue {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used inside a CallProvider');
  return context;
}

export default CallProvider;
