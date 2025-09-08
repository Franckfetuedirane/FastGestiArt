// Service API pour GestiArt - Prêt pour l'intégration avec Django
import { User, ArtisanProfile, Product, Category, Sale, DashboardStats, ArtisanDashboardStats, RegisterData } from '../types';
import { 
  mockUsers, 
  mockArtisans, 
  mockProducts, 
  mockCategories, 
  mockSales, 
  mockDashboardStats 
} from '../data/mockData';

// Configuration de l'API (à adapter avec l'URL de l'API Django)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

// Services pour les produits
export const productsAPI = {
  getAll: async (artisanId?: string): Promise<Product[]> => {
    // En production: GET /products/ ou /products/?artisan={artisanId}
    return artisanId 
      ? mockProducts.filter(p => p.artisanId === artisanId)
      : mockProducts;
  },
  
  getById: async (id: string): Promise<Product | null> => {
    // En production: GET /products/{id}/
    return mockProducts.find(p => p.id === id) || null;
  },
  
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    // En production: POST /products/
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    mockProducts.push(newProduct);
    return newProduct;
  },
  
  update: async (id: string, product: Partial<Product>): Promise<Product | null> => {
    // En production: PUT /products/{id}/
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...product };
      return mockProducts[index];
    }
    return null;
  },
  
  delete: async (id: string): Promise<boolean> => {
    // En production: DELETE /products/{id}/
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Services pour les catégories
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    // En production: GET /categories/
    return mockCategories;
  },
  
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    // En production: POST /categories/
    const newCategory = { ...category, id: `cat-${Date.now()}` };
    mockCategories.push(newCategory);
    return newCategory;
  },
  
  update: async (id: string, category: Partial<Category>): Promise<Category | null> => {
    // En production: PUT /categories/{id}/
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories[index] = { ...mockCategories[index], ...category };
      return mockCategories[index];
    }
    return null;
  },
  
  delete: async (id: string): Promise<boolean> => {
    // En production: DELETE /categories/{id}/
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
      return true;
    }
    return false;
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