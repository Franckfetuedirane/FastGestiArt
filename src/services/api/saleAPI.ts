import { API_CONFIG } from '@/config/api.config';
import { Sale } from '@/types';
import { mockSales } from '@/data/mockData';

export const saleAPI = {
  getAll: async (email?: string, password?: string): Promise<Sale[]> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(mockSales), 500));
    }

    const response = await fetch(`${API_CONFIG.API_URL}/ventes/`, {
      headers: {
        ...(email && password ? {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`
        } : {})
      },
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  create: async (data: Omit<Sale, 'id'>, email?: string, password?: string): Promise<Sale> => {
    if (API_CONFIG.USE_MOCK) {
      const newSale = {
        id: `sale-${Date.now()}`,
        ...data,
        dateDVente: new Date().toISOString()
      };
      mockSales.push(newSale);
      return new Promise(resolve => setTimeout(() => resolve(newSale), 500));
    }

    const response = await fetch(`${API_CONFIG.API_URL}/ventes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(email && password ? {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`
        } : {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  delete: async (id: string, email?: string, password?: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      const index = mockSales.findIndex(s => s.id === id);
      if (index !== -1) mockSales.splice(index, 1);
      return new Promise(resolve => setTimeout(resolve, 500));
    }

    const response = await fetch(`${API_CONFIG.API_URL}/ventes/${id}/`, {
      method: 'DELETE',
      headers: {
        ...(email && password ? {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`
        } : {})
      }
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
  }
};