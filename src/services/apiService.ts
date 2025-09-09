// Service API pour GestiArt - Prêt pour l'intégration avec Django
import { User, ArtisanProfile, Product, Category, Sale, DashboardStats, ArtisanDashboardStats, RegisterData } from '../types';
import { 
  mockUsers, 
  mockArtisans, 
  mockProducts, 
  mockSales, 
  mockDashboardStats 
} from '../data/mockData';
import { productService } from './productService';

// Configuration de l'API (à adapter avec l'URL de l'API Django)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper pour les appels API (prêt pour axios)
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // En production, remplacer par de vrais appels API
  // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...options.headers,
  //   },
  //   ...options,
  // });
  // return response.json();
  
  // Simulation pour le développement
  await new Promise(resolve => setTimeout(resolve, 500));
  return null;
};

// Services d'authentification
export const authAPI = {
  login: async (email: string, password: string, role: 'admin' | 'artisan'): Promise<User | null> => {
    const user = mockUsers.find(u => u.email === email && u.role === role);
    return user || null;
  },
  
  register: async (data: RegisterData): Promise<boolean> => {
    // En production: POST /auth/register/
    return true;
  },
  
  logout: async (): Promise<void> => {
    // En production: POST /auth/logout/
  }
};

// Services pour les artisans
export const artisansAPI = {
  getAll: async (): Promise<ArtisanProfile[]> => {
    // En production: GET /artisans/
    return mockArtisans;
  },
  
  getById: async (id: string): Promise<ArtisanProfile | null> => {
    // En production: GET /artisans/{id}/
    return mockArtisans.find(a => a.id === id) || null;
  },
  
  create: async (artisan: Omit<ArtisanProfile, 'id'>): Promise<ArtisanProfile> => {
    // En production: POST /artisans/
    const newArtisan = { ...artisan, id: `artisan-${Date.now()}` };
    mockArtisans.push(newArtisan);
    return newArtisan;
  },
  
  update: async (id: string, artisan: Partial<ArtisanProfile>): Promise<ArtisanProfile | null> => {
    // En production: PUT /artisans/{id}/
    const index = mockArtisans.findIndex(a => a.id === id);
    if (index !== -1) {
      mockArtisans[index] = { ...mockArtisans[index], ...artisan };
      return mockArtisans[index];
    }
    return null;
  },
  
  delete: async (id: string): Promise<boolean> => {
    // En production: DELETE /artisans/{id}/
    const index = mockArtisans.findIndex(a => a.id === id);
    if (index !== -1) {
      mockArtisans.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Remplacer la section des services pour les produits par une exportation du service
export { productService };

// Services pour les catégories
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Poterie",
    description: "Art de façonner l'argile",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "2",
    name: "Bijouterie",
    description: "Création de bijoux artisanaux",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02")
  },
  {
    id: "3",
    name: "Sculpture",
    description: "Art de tailler et modeler des matériaux",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03")
  }
];

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCategories), 1000);
    });
  },
  
  create: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    return new Promise((resolve) => {
      const newCategory = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCategories.push(newCategory);
      setTimeout(() => resolve(newCategory), 1000);
    });
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    return new Promise((resolve, reject) => {
      const index = mockCategories.findIndex(c => c.id === id);
      if (index === -1) reject(new Error('Category not found'));
      
      mockCategories[index] = {
        ...mockCategories[index],
        ...data,
        updatedAt: new Date()
      };
      setTimeout(() => resolve(mockCategories[index]), 1000);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const index = mockCategories.findIndex(c => c.id === id);
      if (index !== -1) mockCategories.splice(index, 1);
      setTimeout(resolve, 1000);
    });
  }
};

// Services pour les ventes
export const salesAPI = {
  getAll: async (artisanId?: string): Promise<Sale[]> => {
    // En production: GET /sales/ ou /sales/?artisan={artisanId}
    return artisanId 
      ? mockSales.filter(s => s.artisanId === artisanId)
      : mockSales;
  },
  
  create: async (sale: Omit<Sale, 'id' | 'numeroFacture'>): Promise<Sale> => {
    // En production: POST /sales/
    const newSale = { 
      ...sale, 
      id: `sale-${Date.now()}`,
      numeroFacture: `FACT-${new Date().getFullYear()}-${String(mockSales.length + 1).padStart(3, '0')}`
    };
    mockSales.push(newSale);
    return newSale;
  },
  
  delete: async (id: string): Promise<boolean> => {
    // En production: DELETE /sales/{id}/
    const index = mockSales.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSales.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Services pour les statistiques
export const statsAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // En production: GET /stats/dashboard/
    return mockDashboardStats;
  },
  
  getArtisanStats: async (artisanId: string): Promise<ArtisanDashboardStats> => {
    // En production: GET /stats/artisan/{id}/
    const artisanSales = mockSales.filter(s => s.artisanId === artisanId);
    const artisanProducts = mockProducts.filter(p => p.artisanId === artisanId);
    
    return {
      ventesTotales: artisanSales.length,
      caTotal: artisanSales.reduce((sum, sale) => sum + sale.montantTotal, 0),
      nombreProduits: artisanProducts.length,
      ventesParMois: [
        { mois: 'Jan', montant: artisanSales.filter(s => s.dateDVente.includes('2024-01')).reduce((sum, s) => sum + s.montantTotal, 0) },
        { mois: 'Fév', montant: artisanSales.filter(s => s.dateDVente.includes('2024-02')).reduce((sum, s) => sum + s.montantTotal, 0) }
      ],
      topProduits: artisanProducts.map(p => ({
        nom: p.nom,
        ventes: artisanSales.filter(s => s.productId === p.id).length
      })),
      stockRestant: artisanProducts.map(p => ({
        produit: p.nom,
        stock: p.stock
      }))
    };
  }
};

// Services pour les utilisateurs
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    // En production: GET /users/
    return mockUsers;
  },
  
  getById: async (id: string): Promise<User | null> => {
    // En production: GET /users/{id}/
    return mockUsers.find(u => u.id === id) || null;
  },
  
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    // En production: POST /users/
    const newUser = { ...user, id: `user-${Date.now()}` };
    mockUsers.push(newUser);
    return newUser;
  },
  
  update: async (id: string, user: Partial<User>): Promise<User | null> => {
    // En production: PUT /users/{id}/
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...user };
      return mockUsers[index];
    }
    return null;
  },
  
  delete: async (id: string): Promise<boolean> => {
    // En production: DELETE /users/{id}/
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Services pour les produits
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 1000);
    });
  },

  create: async (data: Omit<Product, 'id' | 'dateCreation'>): Promise<Product> => {
    const newProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      dateCreation: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    mockProducts[index] = { ...mockProducts[index], ...data };
    return mockProducts[index];
  },

  delete: async (id: string): Promise<void> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    }
  },

  updateStock: async (id: string, quantity: number): Promise<Product> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    const newStock = mockProducts[index].stock + quantity;
    if (newStock < 0) throw new Error('Stock insuffisant');
    
    mockProducts[index] = {
      ...mockProducts[index],
      stock: newStock
    };
    return mockProducts[index];
  }
};

// export { salesAPI, artisansAPI, categoriesAPI };