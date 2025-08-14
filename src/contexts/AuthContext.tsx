'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session with comprehensive error handling
    const getInitialSession = async () => {
      try {
        // Test basic supabase connection first
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase session error (continuing without auth):', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Supabase connection failed (continuing without auth):', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Small delay to prevent blocking render
    const timeoutId = setTimeout(() => {
      getInitialSession();
    }, 100);

    // Listen for auth changes with error handling
    let subscription: any = null;
    try {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      });
      subscription = sub;
    } catch (error) {
      console.warn('Auth state change listener failed:', error);
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn('Failed to unsubscribe from auth changes:', error);
        }
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('useAuth used outside AuthProvider, returning default values');
    return {
      user: null,
      session: null,
      loading: false,
      signIn: async () => ({ error: 'Not connected to auth provider' }),
      signUp: async () => ({ error: 'Not connected to auth provider' }),
      signOut: async () => {},
      updatePassword: async () => ({ error: 'Not connected to auth provider' }),
    };
  }
  return context;
}