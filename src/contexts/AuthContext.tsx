import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile, AppRole } from '../types/database.types';

// (تعريف الواجهة لم يتغير)
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true); // (البداية صحيحة)

  useEffect(() => {
    console.log('[AuthProvider] mounted - init auth');

    // 1. الدالة التي تعمل عند تحميل الصفحة أول مرة
    const fetchSessionAndProfile = async () => {
      console.log('[AuthProvider] fetchSessionAndProfile - start');
      setLoading(true); // ابدأ التحميل

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('[AuthProvider] getSession result:', { session, sessionError });
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          console.log('[AuthProvider] profile fetch result:', { profileData, profileError });
          if (profileError || !profileData) {
            console.warn('[AuthProvider] profile missing for user, attempting to create a default profile', { profileError });
            try {
              const upsert = await supabase
                .from('profiles')
                .upsert({ id: currentUser.id, full_name: currentUser.email ?? null, role: 'employee' })
                .select()
                .maybeSingle();
              console.log('[AuthProvider] profile upsert result:', upsert);
              if (upsert.data) {
                setProfile(upsert.data as Profile);
                setRole((upsert.data as Profile).role);
              } else {
                setProfile(null);
                setRole(null);
              }
            } catch (upsertErr) {
              console.error('[AuthProvider] error creating profile:', upsertErr);
              setProfile(null);
              setRole(null);
            }
          } else if (profileData) {
            setProfile(profileData as Profile);
            setRole((profileData as Profile).role);
          }
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (err) {
        console.error('[AuthProvider] fetchSessionAndProfile error', err);
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
      } finally {
        setLoading(false); // <-- أنهِ التحميل بعد جلب الجلسة والملف الشخصي
        console.log('[AuthProvider] fetchSessionAndProfile - finished');
      }
    };

    fetchSessionAndProfile();

    // 2. المستمع لأحداث تسجيل الدخول/الخروج
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AuthProvider] onAuthStateChange - start', { event, newSession });
        setLoading(true); // <-- ابدأ التحميل عند حدوث تغيير
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        try {
          if (currentUser) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            console.log('[AuthProvider] profile fetch on auth change:', { profileData, profileError });
            if (profileData) {
              setProfile(profileData as Profile);
              setRole((profileData as Profile).role);
            } else {
              console.warn('[AuthProvider] profile missing on auth change, attempting upsert', { profileError });
              try {
                const upsert = await supabase
                  .from('profiles')
                  .upsert({ id: currentUser.id, full_name: currentUser.email ?? null, role: 'employee' })
                  .select()
                  .maybeSingle();
                console.log('[AuthProvider] profile upsert on auth change result:', upsert);
                if (upsert.data) {
                  setProfile(upsert.data as Profile);
                  setRole((upsert.data as Profile).role);
                } else {
                  setProfile(null);
                  setRole(null);
                }
              } catch (upsertErr) {
                console.error('[AuthProvider] error upserting profile on auth change:', upsertErr);
                setProfile(null);
                setRole(null);
              }
            }
          } else {
            setProfile(null);
            setRole(null);
          }
        } catch (err) {
          console.error('[AuthProvider] onAuthStateChange error', err);
          setProfile(null);
          setRole(null);
        } finally {
          setLoading(false); // <-- أنهِ التحميل بعد التغيير
          console.log('[AuthProvider] onAuthStateChange - finished');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('[AuthProvider] state update:', { session, profile, role, loading });
  }, [session, profile, role, loading]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Set session and user immediately
      setSession(data.session);
      setUser(data.user);

      // Fetch and set profile
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) throw profileError;
        if (profileData) {
          setProfile(profileData as Profile);
          setRole((profileData as Profile).role);
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    role,
    loading,
    signIn,
    signOut
  };

  // Always render children; let consumers (ProtectedRoute) show loading states.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}