import { API_CONFIG } from '@/config/api.config';
import { User } from '@/types';
import { localStorageService } from '../localStorageService';

// Fonction utilitaire pour formater la date au format ISO
const formatDate = (date: Date): string => date.toISOString();

export const userAPI = {
  // Récupérer tous les utilisateurs (admin uniquement)
  getAll: async (): Promise<User[]> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const users = localStorageService.getUsers();
        setTimeout(() => resolve(users), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/users/`);
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Récupérer un utilisateur par son ID
  getById: async (id: string): Promise<User> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const users = localStorageService.getUsers();
        const user = users.find(u => u.id === id);
        
        setTimeout(() => {
          if (user) {
            resolve(user);
          } else {
            reject(new Error('Utilisateur non trouvé'));
          }
        }, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/users/${id}/`);
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Créer un nouvel utilisateur (inscription)
  create: async (data: Omit<User, 'id' | 'dateCreation'>): Promise<User> => {
    const now = formatDate(new Date());
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      dateCreation: now,
    };

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const users = localStorageService.getUsers();
        
        // Vérifier si l'email est déjà utilisé
        if (users.some(u => u.email === data.email)) {
          throw new Error('Un utilisateur avec cet email existe déjà');
        }
        
        users.push(newUser);
        localStorageService.saveUsers(users);
        setTimeout(() => resolve(newUser), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erreur API: ${response.statusText}`);
    }
    return response.json();
  },

  // Mettre à jour un utilisateur existant
  update: async (id: string, data: Partial<Omit<User, 'id' | 'dateCreation'>>): Promise<User> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const users = localStorageService.getUsers();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (data.email && users.some((u, i) => i !== index && u.email === data.email)) {
          reject(new Error('Un utilisateur avec cet email existe déjà'));
          return;
        }
        
        const updatedUser = { 
          ...users[index], 
          ...data,
          updatedAt: formatDate(new Date()) 
        };
        
        users[index] = updatedUser;
        localStorageService.saveUsers(users);
        
        setTimeout(() => resolve(updatedUser), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/users/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erreur API: ${response.statusText}`);
    }
    return response.json();
  },

  // Supprimer un utilisateur
  delete: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const users = localStorageService.getUsers();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        
        // Empêcher la suppression du dernier administrateur
        const adminUsers = users.filter(u => u.user_type === 'admin');
        if (users[index].user_type === 'admin' && adminUsers.length <= 1) {
          reject(new Error('Impossible de supprimer le dernier administrateur'));
          return;
        }
        
        users.splice(index, 1);
        localStorageService.saveUsers(users);
        
        setTimeout(resolve, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/users/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erreur API: ${response.statusText}`);
    }
  },

  // Changer le mot de passe
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const users = localStorageService.getUsers();
        const user = users.find(u => u.id === id);
        
        if (!user) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }
        
        // En mode mock, on ne vérifie pas le mot de passe actuel
        // Dans une implémentation réelle, il faudrait vérifier le mot de passe actuel
        
        // Simuler la mise à jour du mot de passe
        setTimeout(() => resolve(), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/users/${id}/change-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erreur API: ${response.statusText}`);
    }
  },
};
