"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
    setIsLoading(false);
  }, [session, status]);

  return (
    <UserContext.Provider value={{ userName, setUserName, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};