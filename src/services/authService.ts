import { authAPI } from './api/authAPI';
import { userAPI } from './api/userAPI';
import { localStorageService } from './localStorageService';
import { User, RegisterData } from '@/types';

class AuthService {
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Vérifier si un token est présent dans le localStorage
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
  
  // Se connecter
  async login(email: string, password: string): Promise<User> {
    try {
      const user = await authAPI.login(email, password);
      
      // En mode mock, on stocke l'utilisateur dans le localStorage
      // En production, on stockerait un token JWT
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      
      // Mettre à jour la date de dernière connexion
      if (user.id) {
        localStorageService.updateUser(user.id, { 
          lastLogin: new Date().toISOString() 
        });
      }
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }
  
  // S'inscrire
  async register(userData: RegisterData): Promise<User> {
    try {
      const user = await authAPI.register(userData);
      
      // En mode mock, on stocke l'utilisateur dans le localStorage
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }
  
  // Se déconnecter
  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }
  
  // Récupérer l'utilisateur courant avec vérification de l'authentification
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    // Vérifier d'abord si un token d'authentification existe
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('Aucun token d\'authentification trouvé');
      return null;
    }
    
    // Récupérer les informations de l'utilisateur
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) {
      console.log('Aucune donnée utilisateur trouvée dans le stockage local');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      
      // Vérifier que l'utilisateur a les propriétés requises
      if (!user || !user.id || !user.email || !user.user_type) {
        console.error('Données utilisateur incomplètes ou invalides:', user);
        return null;
      }
      
      console.log('Utilisateur récupéré du stockage local:', {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        hasArtisanProfile: !!user.artisanProfile
      });
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'utilisateur:', error);
      return null;
    }
  }
  
  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    console.log(`Vérification du rôle: ${role}, rôle actuel: ${user.user_type}`);
    return user.user_type === role;
  }
  
  // Vérifier si l'utilisateur est authentifié (version améliorée)
  isUserAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const isAuth = !!user;
    console.log('Vérification de l\'authentification:', isAuth);
    return isAuth;
  }
  
  // Vérifier si l'utilisateur est un administrateur
  isAdmin(): boolean {
    return this.hasRole('admin');
  }
  
  // Vérifier si l'utilisateur est un artisan
  isArtisan(): boolean {
    return this.hasRole('artisan');
  }
  
  // Rafraîchir le token d'authentification
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const response = await authAPI.refreshToken(refreshToken);
      // S'assurer que la réponse contient un token d'accès
      if (response && response.accessToken) {
        return {
          accessToken: response.accessToken
        };
      }
      throw new Error('Réponse de rafraîchissement de token invalide');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
  
  // Mettre à jour le profil utilisateur
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updatedUser = await userAPI.update(userId, updates);
      
      // Mettre à jour l'utilisateur dans le localStorage si c'est l'utilisateur courant
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
  
  // Changer le mot de passe
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    return userAPI.changePassword(userId, currentPassword, newPassword);
  }
}

export const authService = new AuthService();
