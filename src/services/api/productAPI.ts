import { Product } from '@/types';
import { API_CONFIG } from '@/config/api.config';
import { localStorageService } from '../localStorageService';

// Fonction pour générer un ID unique
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const productAPI = {
  // Récupérer tous les produits
  getAll: async (): Promise<Product[]> => {
    console.log('Début du chargement des produits...');
    
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        try {
          const products = localStorageService.getProducts();
          console.log('Produits chargés depuis le localStorage:', products.length);
          setTimeout(() => {
            console.log('Résolution de la promesse avec les produits');
            resolve(products);
          }, 500);
        } catch (error) {
          console.error('Erreur lors de la récupération des produits depuis le localStorage:', error);
          resolve([]); // Retourner un tableau vide en cas d'erreur
        }
      });
    }
    
    // Implémentation pour une API réelle
    try {
      console.log('Chargement des produits depuis l\'API...');
      const response = await fetch(`${API_CONFIG.API_URL}/produits/`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur API (${response.status}): ${errorText}`);
        throw new Error(`Erreur API: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Produits chargés depuis l\'API:', data.length);
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des produits depuis l\'API:', error);
      throw error;
    }
  },

  // Récupérer un produit par son ID
  getById: async (id: string): Promise<Product> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const products = localStorageService.getProducts();
        const product = products.find(p => p.id === id);
        setTimeout(() => {
          if (product) {
            resolve(product);
          } else {
            reject(new Error('Produit non trouvé'));
          }
        }, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/produits/${id}/`);
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Créer un nouveau produit
  create: async (data: Omit<Product, 'id' | 'dateCreation' | 'artisan'> & { artisanId: string }): Promise<Product> => {
    const newProduct: Product = {
      ...data,
      artisan: {
        id: data.artisanId,
        nom: '',
        prenom: '',
        specialite: '',
        telephone: '',
        email: '',
        adresse: '',
        departement: '',
        dateInscription: new Date().toISOString(),
        photo: '',
        dateCreation: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      id: generateId(),
      dateCreation: new Date().toISOString(),
    };

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const products = localStorageService.getProducts();
        products.push(newProduct);
        localStorageService.saveProducts(products);
        setTimeout(() => resolve(newProduct), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/produits/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Mettre à jour un produit existant
  update: async (id: string, data: Partial<Omit<Product, 'id' | 'dateCreation'>>): Promise<Product> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const products = localStorageService.getProducts();
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) {
          reject(new Error('Produit non trouvé'));
          return;
        }
        
        const updatedProduct = { ...products[index], ...data };
        products[index] = updatedProduct;
        localStorageService.saveProducts(products);
        
        setTimeout(() => resolve(updatedProduct), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/produits/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Supprimer un produit
  delete: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const products = localStorageService.getProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        localStorageService.saveProducts(filteredProducts);
        setTimeout(resolve, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/produits/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
  },

  // Mettre à jour le stock d'un produit
  updateStock: async (productId: string, quantity: number): Promise<Product> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const products = localStorageService.getProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index === -1) {
          reject(new Error('Produit non trouvé'));
          return;
        }
        
        const updatedProduct = { 
          ...products[index], 
          stock: Math.max(0, products[index].stock + quantity) 
        };
        
        products[index] = updatedProduct;
        localStorageService.saveProducts(products);
        
        setTimeout(() => resolve(updatedProduct), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/produits/${productId}/update-stock/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },
};