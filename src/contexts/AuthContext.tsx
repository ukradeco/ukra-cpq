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
    // 1. الدالة التي تعمل عند تحميل الصفحة أول مرة
    const fetchSessionAndProfile = async () => {
      setLoading(true); // ابدأ التحميل
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setLoading(false); // أنهِ التحميل عند الخطأ
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

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfile(profileData as Profile);
          setRole((profileData as Profile).role);
        }
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false); // <-- أنهِ التحميل بعد جلب الجلسة والملف الشخصي
    };

    fetchSessionAndProfile();

    // 2. المستمع لأحداث تسجيل الدخول/الخروج
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true); // <-- ابدأ التحميل عند حدوث تغيير
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (profileData) {
            setProfile(profileData as Profile);
            setRole((profileData as Profile).role);
          } else {
            console.error("Error fetching profile on auth change:", profileError);
            setProfile(null);
            setRole(null);
          }
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false); // <-- (هذا هو السطر المفقود) أنهِ التحميل بعد التغيير
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

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

  // لا تعرض التطبيق إلا بعد انتهاء التحميل الأولي
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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