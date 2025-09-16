import { API_CONFIG } from '@/config/api.config';
import { Category } from '@/types';
import { localStorageService } from '../localStorageService';

// Fonction utilitaire pour formater la date au format ISO
const formatDate = (date: Date): string => date.toISOString();

export const categoryAPI = {
  // Récupérer toutes les catégories
  getAll: async (): Promise<Category[]> => {
    console.log('Début du chargement des catégories...');
    
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        try {
          const categories = localStorageService.getCategories();
          console.log('Catégories chargées depuis le localStorage:', categories.length);
          setTimeout(() => {
            console.log('Résolution de la promesse avec les catégories');
            resolve(categories);
          }, 500);
        } catch (error) {
          console.error('Erreur lors de la récupération des catégories depuis le localStorage:', error);
          resolve([]); // Retourner un tableau vide en cas d'erreur
        }
      });
    }
    
    // Implémentation pour une API réelle
    try {
      console.log('Chargement des catégories depuis l\'API...');
      const response = await fetch(`${API_CONFIG.API_URL}/categories/`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur API (${response.status}): ${errorText}`);
        throw new Error(`Erreur API: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Catégories chargées depuis l\'API:', data.length);
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des catégories depuis l\'API:', error);
      throw error;
    }
  },

  // Récupérer une catégorie par son ID
  getById: async (id: string): Promise<Category> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const categories = localStorageService.getCategories();
        const category = categories.find(c => c.id === id);
        
        setTimeout(() => {
          if (category) {
            resolve(category);
          } else {
            reject(new Error('Catégorie non trouvée'));
          }
        }, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/categories/${id}/`);
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Créer une nouvelle catégorie
  create: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    const now = formatDate(new Date());
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const categories = localStorageService.getCategories();
        categories.push(newCategory);
        localStorageService.saveCategories(categories);
        setTimeout(() => resolve(newCategory), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory),
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Mettre à jour une catégorie existante
  update: async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const categories = localStorageService.getCategories();
        const index = categories.findIndex(c => c.id === id);
        
        if (index === -1) {
          reject(new Error('Catégorie non trouvée'));
          return;
        }
        
        const updatedCategory = { 
          ...categories[index], 
          ...data, 
          updatedAt: formatDate(new Date()) 
        };
        
        categories[index] = updatedCategory;
        localStorageService.saveCategories(categories);
        
        setTimeout(() => resolve(updatedCategory), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/categories/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Supprimer une catégorie
  delete: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const categories = localStorageService.getCategories();
        const index = categories.findIndex(c => c.id === id);
        
        if (index === -1) {
          reject(new Error('Catégorie non trouvée'));
          return;
        }
        
        // Vérifier si la catégorie est utilisée par des produits
        const products = localStorageService.getProducts();
        const isUsed = products.some(p => p.categorie === id);
        
        if (isUsed) {
          reject(new Error('Impossible de supprimer cette catégorie car elle est utilisée par des produits'));
          return;
        }
        
        categories.splice(index, 1);
        localStorageService.saveCategories(categories);
        
        setTimeout(resolve, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/categories/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
  },
};
