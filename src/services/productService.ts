import { Product } from '../types';
import { mockProducts } from '../data/mockData';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const productService = {
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
    const newProduct = { 
      ...product, 
      id: `prod-${Date.now()}`,
      dateCreation: new Date().toISOString()
    };
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
  },

  // Nouvelle méthode pour gérer le stock
  updateStock: async (id: string, quantity: number): Promise<Product | null> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const newStock = mockProducts[index].stock + quantity;
    if (newStock < 0) throw new Error('Stock insuffisant');

    mockProducts[index] = {
      ...mockProducts[index],
      stock: newStock
    };
    return mockProducts[index];
  }
};