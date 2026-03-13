import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role: string;
  accessible_modules?: string[];
};

interface AuthContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isSessionVerified: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cablefill_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.username && !parsed.email) {
          parsed.email = parsed.username;
        }
        if (parsed.email) {
          return parsed;
        }
      } catch (e) {
        // Ignore parse error
      }
    }
    return null;
  });
  const [isSessionVerified, setIsSessionVerified] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (error.message?.includes('Refresh Token Not Found') || error.message?.includes('invalid_grant')) {
          supabase.auth.signOut().catch(() => {});
        } else {
          console.error('Auth session error:', error);
        }
        setUser(null);
        localStorage.removeItem('cablefill_user');
      } else if (session?.user) {
        supabase.from('User').select('*').eq('id', session.user.id).single().then(({ data: profile }) => {
          if (profile) {
            if (profile.email === 'rafael.azevedo.93@live.com' && !profile.name) {
              supabase.from('User').update({ name: 'Rafael Azevedo', full_name: 'Rafael Azevedo' }).eq('id', profile.id).then(({ error: updateError }) => {
                if (!updateError) {
                  const updatedUser = { 
                    id: profile.id, 
                    email: profile.email, 
                    name: 'Rafael Azevedo',
                    role: 'admin',
                    accessible_modules: profile.accessible_modules || ['cablefill', 'capitolato']
                  };
                  setUser(updatedUser);
                  localStorage.setItem('cablefill_user', JSON.stringify(updatedUser));
                } else {
                  console.error('Failed to auto-update master admin name:', updateError);
                  supabase.from('User').update({ name: 'Rafael Azevedo' }).eq('id', profile.id);
                }
              });
            } else if (profile.is_approved === 1 || profile.email === 'rafael.azevedo.93@live.com') {
              const loggedUser = { 
                id: profile.id, 
                email: profile.email, 
                name: profile.name || profile.full_name || profile.nome || profile.display_name || profile.username || session.user.user_metadata?.name || session.user.user_metadata?.full_name,
                role: profile.email === 'rafael.azevedo.93@live.com' ? 'admin' : profile.role,
                accessible_modules: profile.accessible_modules || ['cablefill', 'capitolato']
              };
              setUser(loggedUser);
              localStorage.setItem('cablefill_user', JSON.stringify(loggedUser));
            }
          }
        });
      }
      setIsSessionVerified(true);
    }).catch((err) => {
      console.error('Auth catch error:', err);
      setUser(null);
      localStorage.removeItem('cablefill_user');
      setIsSessionVerified(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session) || !session) {
        setUser(null);
        localStorage.removeItem('cablefill_user');
      }
      if (event === 'USER_UPDATED' && !session) {
        setUser(null);
        localStorage.removeItem('cablefill_user');
      }
    });

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = typeof event.reason === 'string' ? event.reason : (event.reason?.message || '');
      if (errorMsg.includes('Refresh Token') || errorMsg.includes('refresh_token') || errorMsg.includes('invalid_grant')) {
        event.preventDefault();
        supabase.auth.signOut().catch(() => {});
        setUser(null);
        localStorage.removeItem('cablefill_user');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('cablefill_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isSessionVerified, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
