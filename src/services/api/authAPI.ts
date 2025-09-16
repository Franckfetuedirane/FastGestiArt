import { API_CONFIG } from '@/config/api.config';
import { User, RegisterData } from '@/types';
import { localStorageService } from '../localStorageService';

const STORAGE_KEYS = {
  USERS: 'gesti_art_users',
  PRODUCTS: 'gesti_art_products',
  CATEGORIES: 'gesti_art_categories',
  ARTISANS: 'gesti_art_artisans',
  SALES: 'gesti_art_sales'
};

// On utilise désormais RegisterData depuis les types partagés

// Fonction utilitaire pour formater la date au format ISO
const formatDate = (date: Date): string => date.toISOString();

// Fonction pour initialiser les comptes par défaut
const initializeDefaultAccounts = (): void => {
  if (typeof window === 'undefined') return;
  
  // Vérifier si les utilisateurs existent déjà
  const users = localStorageService.getUsers();
  
  // Vérifier si les comptes par défaut existent déjà
  const adminExists = users.some(u => u.email === 'admin@gestiart.com');
  const artisanExists = users.some(u => u.email === 'artisan@gestiart.com');
  
  if (!adminExists || !artisanExists) {
    const now = new Date().toISOString();
    
    // Créer le compte admin s'il n'existe pas
    if (!adminExists) {
      users.push({
        id: 'admin-1',
        email: 'admin@gestiart.com',
        user_type: 'admin',
        nom: 'Admin',
        prenom: 'Système',
        telephone: '0600000000',
        adresse: 'Siège social',
        dateCreation: now,
        updatedAt: now,
        lastLogin: now,
        isActive: true,
        isSuperAdmin: true
      });
    }
    
    // Créer le compte artisan s'il n'existe pas
    if (!artisanExists) {
      users.push({
        id: 'artisan-1',
        email: 'artisan@gestiart.com',
        user_type: 'artisan',
        nom: 'Dupont',
        prenom: 'Marie',
        telephone: '0601020304',
        adresse: '123 Rue des Artisans, 75000 Paris',
        dateCreation: now,
        updatedAt: now,
        lastLogin: now,
        isActive: true,
        artisanProfile: {
          id: 'artisan-profile-1',
          userId: 'artisan-1',
          specialite: 'Céramique',
          description: 'Artisan céramiste spécialisé dans les pièces uniques',
          anneesExperience: 5,
          statut: 'actif'
        }
      });
    }
    
    // Sauvegarder les utilisateurs mis à jour
    localStorageService.saveUsers(users);
  }
};

export const authAPI = {
  // Enregistrer un nouvel utilisateur avec validation avancée
  register: async (userData: RegisterData): Promise<User> => {
    // Validation des champs obligatoires
    const requiredFields = ['email', 'password', 'nom', 'prenom', 'telephone', 'adresse', 'user_type'] as const;
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Les champs suivants sont obligatoires : ${missingFields.join(', ')}`);
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Veuillez fournir une adresse email valide');
    }

    // Validation du mot de passe
    if (userData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    // Validation du type d'utilisateur
    const allowedUserTypes = ['admin', 'artisan', 'secondary_admin'];
    if (!allowedUserTypes.includes(userData.user_type)) {
      throw new Error('Type d\'utilisateur invalide');
    }
    
    // Vérification de la force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
    }

    // Déterminer le type d'utilisateur (par défaut: artisan)
    const userType = userData.user_type || 'artisan';
    
    // Vérifier si le rôle est valide
    if (!['admin', 'artisan', 'user'].includes(userType)) {
      throw new Error('Type d\'utilisateur invalide');
    }

    const now = formatDate(new Date());
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.trim().toLowerCase(), // Normaliser l'email en minuscules
      user_type: userType,
      nom: userData.nom.trim(),
      prenom: userData.prenom.trim(),
      telephone: userData.telephone.trim(),
      adresse: userData.adresse.trim(),
      dateCreation: now,
      updatedAt: now,
      lastLogin: now,
      isActive: true,
      // Ajouter un profil d'artisan si nécessaire
      ...(userType === 'artisan' ? {
        artisanProfile: {
          id: `artisan-${Date.now()}`,
          userId: ``, // Sera mis à jour après la création de l'utilisateur
          specialite: 'Artisanat général',
          description: 'Artisan créatif passionné par son métier',
          anneesExperience: 0,
          statut: 'en_attente' as const
        }
      } : {})
    };
    
    // Mettre à jour l'ID de l'utilisateur dans le profil artisan si nécessaire
    if (newUser.artisanProfile) {
      newUser.artisanProfile.userId = newUser.id;
    }

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        try {
          // Simuler un délai réseau
          setTimeout(async () => {
            try {
              // Initialiser les comptes par défaut si nécessaire
              initializeDefaultAccounts();
              
              if (typeof window === 'undefined') {
                throw new Error('Impossible d\'accéder au stockage local');
              }
              
              // Vérifier si l'email est déjà utilisé
              const existingUser = localStorageService.findUserByEmail(newUser.email);
              if (existingUser) {
                throw new Error('Un utilisateur avec cet email existe déjà');
              }
              
              // Ajouter le nouvel utilisateur
              const users = localStorageService.getUsers();
              users.push(newUser);
              localStorageService.saveUsers(users);
              
              console.log(`✅ Nouvel utilisateur enregistré: ${newUser.email}`);
              resolve(newUser);
            } catch (error) {
              console.error('❌ Erreur lors de l\'inscription en mode mock:', error);
              reject(error instanceof Error ? error : new Error('Erreur lors de l\'inscription'));
            }
          }, 500);
        } catch (error) {
          console.error('❌ Erreur lors de l\'inscription:', error);
          reject(new Error('Une erreur est survenue lors de l\'inscription'));
        }
      });
    }
    
    // En mode production, on fait un appel API réel
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          user_type: userData.user_type || 'artisan',
          nom: userData.nom,
          prenom: userData.prenom,
          telephone: userData.telephone,
          adresse: userData.adresse,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      return response.json();
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de l\'inscription');
    }
  },

  // Connexion d'un utilisateur avec vérification du rôle
  login: async (email: string, password: string, role?: 'admin' | 'artisan'): Promise<User> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        console.log(`📦 Mode mock: tentative de connexion pour ${email} avec le rôle: ${role || 'non spécifié'}`);
        
        setTimeout(() => {
          try {
            // Initialiser les comptes par défaut si nécessaire
            initializeDefaultAccounts();
            
            const users = localStorageService.getUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
              console.error(`❌ Échec de connexion: utilisateur ${email} non trouvé`);
              reject(new Error('Identifiants incorrects'));
              return;
            }
            
            // Vérifier que l'utilisateur a le bon rôle si spécifié
            if (role && user.user_type !== role) {
              console.error(`❌ Accès refusé: l'utilisateur n'a pas le rôle ${role}`);
              reject(new Error(`Accès refusé. Rôle requis: ${role}`));
              return;
            }
            
            // En mode mock, on vérifie que le mot de passe n'est pas vide
            // Pour les comptes par défaut, on utilise un mot de passe prédéfini
            const defaultPassword = 'password123';
            const isDefaultAccount = email === 'admin@gestiart.com' || email === 'artisan@gestiart.com';
            
            if (isDefaultAccount && password !== defaultPassword) {
              console.error('❌ Mot de passe incorrect pour le compte par défaut');
              reject(new Error('Identifiants incorrects'));
              return;
            }
            
            if (!isDefaultAccount && !password) {
              console.error('❌ Mot de passe requis');
              reject(new Error('Mot de passe requis'));
              return;
            }
            
            // Mettre à jour la date de dernière connexion
            user.lastLogin = formatDate(new Date());
            const updatedUsers = users.map(u => u.id === user.id ? user : u);
            localStorageService.saveUsers(updatedUsers);
            
            console.log(`✅ Connexion réussie pour ${email} avec le rôle ${user.user_type}`);
            resolve(user);
          } catch (error) {
            console.error('❌ Erreur lors de la connexion en mode mock:', error);
            reject(new Error('Une erreur est survenue lors de la connexion'));
          }
        }, 500);
      });
    }

    // Implémentation pour une API réelle
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (response.status === 404) {
          throw new Error('Utilisateur non trouvé');
        } else {
          throw new Error(`Erreur de connexion: ${response.statusText}`);
        }
      }

      const user = await response.json();
      console.log(`✅ Connexion réussie pour ${email}`);
      return user;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  },
  
  // Déconnexion de l'utilisateur
  logout: async (): Promise<void> => {
    const clearAuthData = (): void => {
      // Nettoyer toutes les données d'authentification du localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('refresh_token');
      console.log('🔒 Données d\'authentification supprimées');
    };

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        try {
          console.log('📦 Mode mock: tentative de déconnexion');
          
          // Simuler un délai réseau
          setTimeout(() => {
            try {
              clearAuthData();
              console.log('✅ Déconnexion réussie (mode mock)');
              resolve();
            } catch (error) {
              console.error('❌ Erreur lors de la déconnexion en mode mock:', error);
              reject(new Error('Échec de la déconnexion'));
            }
          }, 300);
        } catch (error) {
          console.error('❌ Erreur inattendue lors de la déconnexion en mode mock:', error);
          reject(new Error('Une erreur inattendue est survenue'));
        }
      });
    }
    
    // En mode production, on fait un appel API réel
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Même en cas d'échec de la requête, on nettoie le stockage local
      clearAuthData();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la déconnexion');
      }

      console.log('✅ Déconnexion réussie');
      return;
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      
      // En cas d'erreur, on nettoie quand même le stockage local
      clearAuthData();
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Une erreur inattendue est survenue lors de la déconnexion');
    }
  },
  
  // Rafraîchir le token d'authentification
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    if (API_CONFIG.USE_MOCK) {
      // En mode mock, on retourne un token factice
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ accessToken: 'mock-access-token' });
        }, 300);
      });
    } else {
      // En mode production, on fait un appel API réel
      try {
        const response = await fetch(`${API_CONFIG.API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Impossible de rafraîchir le token');
        }
        
        return response.json();
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        throw error;
      }
    }
  },
};