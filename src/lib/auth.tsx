import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  /** True until the initial session check resolves. */
  initializing: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, initializing: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ session, initializing }), [session, initializing]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** The signed-in user's id, or undefined when signed out. */
export function useUserId() {
  return useContext(AuthContext).session?.user.id;
}
