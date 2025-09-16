import { Product, Category, ArtisanProfile, Sale, User } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'gesti_art_products',
  CATEGORIES: 'gesti_art_categories',
  ARTISANS: 'gesti_art_artisans',
  SALES: 'gesti_art_sales',
  USERS: 'gesti_art_users'
};

// Fonction utilitaire pour récupérer les données du localStorage
const getFromLocalStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${key} depuis le localStorage:`, error);
    return defaultValue;
  }
};

// Fonction utilitaire pour sauvegarder les données dans le localStorage
const saveToLocalStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de ${key} dans le localStorage:`, error);
  }
};

export const localStorageService = {
  // Produits
  getProducts: (): Product[] => {
    return getFromLocalStorage<Product>(STORAGE_KEYS.PRODUCTS, []);
  },
  
  saveProducts: (products: Product[]): void => {
    saveToLocalStorage<Product>(STORAGE_KEYS.PRODUCTS, products);
  },
  
  // Catégories
  getCategories: (): Category[] => {
    return getFromLocalStorage<Category>(STORAGE_KEYS.CATEGORIES, []);
  },
  
  saveCategories: (categories: Category[]): void => {
    saveToLocalStorage<Category>(STORAGE_KEYS.CATEGORIES, categories);
  },
  
  // Artisans
  getArtisans: (): ArtisanProfile[] => {
    return getFromLocalStorage<ArtisanProfile>(STORAGE_KEYS.ARTISANS, []);
  },
  
  saveArtisans: (artisans: ArtisanProfile[]): void => {
    saveToLocalStorage<ArtisanProfile>(STORAGE_KEYS.ARTISANS, artisans);
  },
  
  // Ventes
  getSales: (): Sale[] => {
    return getFromLocalStorage<Sale>(STORAGE_KEYS.SALES, []);
  },
  
  saveSales: (sales: Sale[]): void => {
    saveToLocalStorage<Sale>(STORAGE_KEYS.SALES, sales);
  },
  
  // Utilisateurs
  getUsers: (): User[] => {
    return getFromLocalStorage<User>(STORAGE_KEYS.USERS, []);
  },
  
  saveUsers: (users: User[]): void => {
    saveToLocalStorage<User>(STORAGE_KEYS.USERS, users);
  },
  
  // Méthode utilitaire pour trouver un utilisateur par email
  findUserByEmail: (email: string): User | undefined => {
    const users = getFromLocalStorage<User>(STORAGE_KEYS.USERS, []);
    return users.find(user => user.email === email);
  },
  
  // Méthode utilitaire pour mettre à jour un utilisateur
  updateUser: (id: string, updates: Partial<User>): User | undefined => {
    const users = getFromLocalStorage<User>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return undefined;
    
    const updatedUser = { 
      ...users[index], 
      ...updates,
      updatedAt: new Date().toISOString() 
    };
    
    users[index] = updatedUser;
    saveToLocalStorage<User>(STORAGE_KEYS.USERS, users);
    return updatedUser;
  },
  
  // Initialisation avec des données par défaut si vide
  initializeIfEmpty: (): void => {
    if (typeof window === 'undefined') return;
    
    // Vérifier et initialiser chaque clé si nécessaire
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.ARTISANS)) {
      localStorage.setItem(STORAGE_KEYS.ARTISANS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    }
    
    // Initialiser les catégories avec des données par défaut si elles n'existent pas
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      const defaultCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'Poterie',
          description: 'Objets en céramique et terre cuite',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cat-2',
          name: 'Textile',
          description: 'Vêtements et accessoires en tissu',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cat-3',
          name: 'Bois',
          description: 'Objets en bois sculpté ou tourné',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cat-4',
          name: 'Métal',
          description: 'Objets en métal forgé ou travaillé',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cat-5',
          name: 'Vannerie',
          description: 'Objets tressés en osier ou rotin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }
    
    // Initialiser les artisans avec des données par défaut s'ils n'existent pas
    if (!localStorage.getItem(STORAGE_KEYS.ARTISANS)) {
      const defaultArtisans: ArtisanProfile[] = [
        {
          id: 'artisan-1',
          nom: 'Dupont',
          prenom: 'Marie',
          specialite: 'Céramique',
          telephone: '0601020304',
          email: 'marie.dupont@example.com',
          adresse: '123 Rue des Artisans, 75000 Paris',
          departement: 'Paris',
          dateInscription: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/women/44.jpg',
          dateCreation: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'artisan-2',
          nom: 'Martin',
          prenom: 'Jean',
          specialite: 'Menuiserie',
          telephone: '0602030405',
          email: 'jean.martin@example.com',
          adresse: '456 Avenue du Bois, 69000 Lyon',
          departement: 'Rhône',
          dateInscription: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/men/32.jpg',
          dateCreation: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'artisan-3',
          nom: 'Bernard',
          prenom: 'Sophie',
          specialite: 'Tissage',
          telephone: '0603040506',
          email: 'sophie.bernard@example.com',
          adresse: '789 Boulevard des Tisserands, 31000 Toulouse',
          departement: 'Haute-Garonne',
          dateInscription: new Date().toISOString(),
          photo: 'https://randomuser.me/api/portraits/women/68.jpg',
          dateCreation: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ARTISANS, JSON.stringify(defaultArtisans));
    }
    
    // Initialiser les utilisateurs avec des comptes par défaut s'ils n'existent pas
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const now = new Date().toISOString();
      
      // Compte administrateur
      const adminUser: User = {
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
      };
      
      // Compte artisan
      const artisanUser: User = {
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
      };
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser, artisanUser]));
    }
  }
};
