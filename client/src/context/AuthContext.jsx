import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { keys } from '../lib/queryClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // The session lives in an httpOnly cookie we can't read from JS, so on every
  // page load we simply ask the server who we are.
  const { data, isPending } = useQuery({
    queryKey: keys.me,
    queryFn: authApi.me,
    staleTime: Infinity,
  });

  const setUser = useCallback(
    (user) => queryClient.setQueryData(keys.me, { user }),
    [queryClient]
  );

  // Switching accounts must not show the previous user's cached feed.
  const startSession = useCallback(
    (user) => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
      setUser(user);
    },
    [queryClient, setUser]
  );

  const login = useCallback(
    async (credentials) => {
      const { user } = await authApi.login(credentials);
      startSession(user);
      return user;
    },
    [startSession]
  );

  const register = useCallback(
    async (details) => {
      const { user } = await authApi.register(details);
      startSession(user);
      return user;
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    startSession(null);
  }, [startSession]);

  const value = useMemo(
    () => ({ user: data?.user ?? null, isLoading: isPending, login, register, logout, setUser }),
    [data, isPending, login, register, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
