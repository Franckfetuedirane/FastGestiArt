import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('gestiart_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'artisan'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérification des credentials mockés
      const foundUser = mockUsers.find(u => u.email === email && u.role === role);
      
      if (foundUser && password === 'password123') {
        setUser(foundUser);
        localStorage.setItem('gestiart_user', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer un nouvel artisan
      const newUser: User = {
        id: `artisan-${Date.now()}`,
        email: data.email,
        role: 'artisan',
        profile: {
          id: `artisan-${Date.now()}`,
          nom: data.nom,
          prenom: data.prenom,
          specialite: data.specialite,
          telephone: data.telephone,
          email: data.email,
          adresse: data.adresse,
          departement: data.departement,
          dateInscription: new Date().toISOString().split('T')[0],
          photo: '/api/placeholder/150/150' // En production, on uploadera la vraie image
        }
      };
      
      // Ajouter aux données mockées (en production, ce sera sauvé en DB)
      mockUsers.push(newUser);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gestiart_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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