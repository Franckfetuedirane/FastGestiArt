import { Sale, SaleItem } from '@/types';
import { mockSales } from '@/data/mockData';
import { productsAPI } from './apiService';

export const saleService = {
  getAll: async (artisanId?: string): Promise<Sale[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sales = artisanId 
          ? mockSales.filter(s => s.artisanId === artisanId)
          : mockSales;
        resolve(sales);
      }, 1000);
    });
  },

  create: async (data: Omit<Sale, 'id' | 'numeroFacture'>): Promise<Sale> => {
    // Mettre à jour le stock des produits
    await Promise.all(
      data.items.map(item => 
        productsAPI.updateStock(item.productId, -item.quantite)
      )
    );

    const newSale = {
      ...data,
      id: `sale-${Date.now()}`,
      numeroFacture: `FACT-${new Date().getFullYear()}-${String(mockSales.length + 1).padStart(3, '0')}`,
    };

    mockSales.push(newSale);
    return newSale;
  },

  update: async (id: string, data: Partial<Sale>): Promise<Sale> => {
    const index = mockSales.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sale not found');

    const oldSale = mockSales[index];

    // Si les items ont changé, mettre à jour le stock
    if (data.items) {
      // Restaurer l'ancien stock
      await Promise.all(
        oldSale.items.map(item =>
          productsAPI.updateStock(item.productId, item.quantite)
        )
      );

      // Mettre à jour avec le nouveau stock
      await Promise.all(
        data.items.map(item =>
          productsAPI.updateStock(item.productId, -item.quantite)
        )
      );
    }

    mockSales[index] = { ...oldSale, ...data };
    return mockSales[index];
  },

  delete: async (id: string): Promise<void> => {
    const index = mockSales.findIndex(s => s.id === id);
    if (index === -1) return;

    const sale = mockSales[index];
    
    // Restaurer le stock
    await Promise.all(
      sale.items.map(item =>
        productsAPI.updateStock(item.productId, item.quantite)
      )
    );

    mockSales.splice(index, 1);
  }
};