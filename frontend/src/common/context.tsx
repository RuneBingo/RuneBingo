'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getAuthenticatedUser, type GetAuthenticatedUserResult } from '@/api/auth';

export type AppContextType = {
  user: GetAuthenticatedUserResult | null;
  refreshUser: () => Promise<GetAuthenticatedUserResult | null>;
};

const AppContext = createContext<AppContextType>({
  user: null,
  refreshUser: async () => null,
});

type AppContextProviderProps = {
  children: React.ReactNode;
  user: GetAuthenticatedUserResult | null;
};

export default function AppContextProvider({ children, user: userProp }: AppContextProviderProps) {
  const [user, setUser] = useState<AppContextType['user'] | null>(userProp);

  const refreshUser = useCallback(async () => {
    const user = await getAuthenticatedUser();
    setUser(user);
    return user;
  }, []);

  const contextValue = useMemo(() => ({ user, refreshUser }), [user, refreshUser]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a AppContextProvider');
  }
  return context;
}
