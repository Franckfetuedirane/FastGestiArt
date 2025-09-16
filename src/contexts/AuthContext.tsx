// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authService } from '@/services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger l'utilisateur au démarrage et s'abonner aux changements
  const loadUser = useCallback(async () => {
    try {
      console.log('Chargement de l\'utilisateur...');
      const currentUser = authService.getCurrentUser();
      console.log('Utilisateur chargé:', currentUser);
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setUser(null);
      return null;
    } finally {
      if (!isInitialized) {
        setIsInitialized(true);
      }
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Effet pour le chargement initial
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Écouter les changements de l'utilisateur dans le stockage local
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        console.log('Changement détecté dans le stockage local, rechargement de l\'utilisateur...');
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUser]);

  // Se connecter avec vérification du rôle
  const login = async (email: string, password: string, role: 'admin' | 'artisan' | 'secondary_admin'): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log(`Tentative de connexion pour ${email} avec le rôle: ${role}`);
      
      const user = await authService.login(email, password, role);
      
      if (user) {
        console.log(`Connexion réussie pour ${email} (${user.user_type})`);
        
        // Vérification du rôle demandé
        if (role && user.user_type !== role) {
          console.warn(`L'utilisateur ${email} n'a pas le rôle ${role} (rôle actuel: ${user.user_type})`);
          throw new Error(`Accès refusé. Rôle ${role} requis.`);
        }
        
        // Vérification que l'utilisateur est actif
        if (user.isActive === false) {
          console.warn(`Tentative de connexion d'un compte désactivé: ${email}`);
          throw new Error('Ce compte a été désactivé. Veuillez contacter un administrateur.');
        }
        
        setUser(user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      // Réinitialiser l'état de chargement en cas d'erreur
      setIsLoading(false);
      throw error; // Propager l'erreur pour une gestion plus précise dans le composant
    } finally {
      if (!user) {
        setIsLoading(false);
      }
    }
  };

  // S'inscrire
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const user = await authService.register(data);
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    }
  };

  // Se déconnecter
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const updatedUser = await authService.updateProfile(userId, updates);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  };

  // Changer le mot de passe
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!user) return false;
      return await authService.changePassword(user.id, currentPassword, newPassword);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    isArtisan: user?.user_type === 'artisan',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};