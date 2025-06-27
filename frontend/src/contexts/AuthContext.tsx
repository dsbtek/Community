import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens, LoginCredentials, UserRegistration, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      try {
        const parsedTokens: AuthTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        // Fetch user profile with stored tokens
        fetchUserProfile(parsedTokens.access);
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        localStorage.removeItem('authTokens');
      }
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async (accessToken: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        // Token might be expired, try to refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (!tokens?.refresh) {
      logout();
      return;
    }

    try {
      const response = await fetch('/api/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });

      if (response.ok) {
        const newTokens: AuthTokens = await response.json();
        setTokens(newTokens);
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        fetchUserProfile(newTokens.access);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const authTokens: AuthTokens = await response.json();
        setTokens(authTokens);
        localStorage.setItem('authTokens', JSON.stringify(authTokens));
        await fetchUserProfile(authTokens.access);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: UserRegistration): Promise<void> => {
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // After successful registration, automatically log in
        await login({
          email: userData.email,
          password: userData.password,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('authTokens');
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!tokens,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
