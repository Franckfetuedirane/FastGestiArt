import { API_CONFIG } from '@/config/api.config';

export interface DashboardStats {
  total_artisans: number;
  active_products: number;
  total_sales_global: string;
  total_revenue: string;
  sales_by_artisan: Array<{
    artisan__first_name: string;
    artisan__last_name: string;
    total_sales: string;
  }>;
  top_selling_products: Array<{
    product__name: string;
    total_quantity_sold: number;
  }>;
}

export interface ArtisanStats {
  ventesTotales: number;
  caTotal: number;
  nombreProduits: number;
  ventesParMois: Array<{
    mois: string;
    montant: number;
  }>;
  topProduits: Array<{
    nom: string;
    ventes: number;
  }>;
  stockRestant: Array<{
    produit: string;
    stock: number;
  }>;
}

export const statsAPI = {
  getDashboardStats: async (email?: string, password?: string): Promise<DashboardStats> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise(resolve => 
        setTimeout(() => resolve({
          total_artisans: 5,
          active_products: 12,
          total_sales_global: "1500.50",
          total_revenue: "1500.50",
          sales_by_artisan: [
            {
              artisan__first_name: "Jean",
              artisan__last_name: "Dupont",
              total_sales: "750.00"
            }
          ],
          top_selling_products: [
            {
              product__name: "Sac en raphia",
              total_quantity_sold: 10
            }
          ]
        }), 500)
      );
    }

    const response = await fetch(`${API_CONFIG.API_URL}/stats/dashboard/`, {
      headers: {
        ...(email && password ? {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`
        } : {})
      },
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  getReportCard: async (email?: string, password?: string) => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise(resolve => 
        setTimeout(() => resolve([
          {
            artisan_name: "Jean Dupont",
            speciality: "Vannerie",
            product_name: "Sac en raphia",
            product_category: "Vannerie",
            product_price: "50.00",
            product_stock: 28,
            total_sales_for_product: 10,
            revenue_for_product: "500.00"
          }
        ]), 500)
      );
    }

    const response = await fetch(`${API_CONFIG.API_URL}/stats/report-card/`, {
      headers: {
        ...(email && password ? {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`
        } : {})
      },
    });

    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  getArtisanStats: async (artisanId: string): Promise<ArtisanStats> => {
    if (API_CONFIG.USE_MOCK) {
      console.log(` Génération de données mock pour l'artisan ${artisanId}`);
      
      // Données de test pour les statistiques
      return new Promise(resolve => 
        setTimeout(() => resolve({
          ventesTotales: 24,
          caTotal: 1250000,
          nombreProduits: 8,
          ventesParMois: [
            { mois: 'Jan', montant: 250000 },
            { mois: 'Fév', montant: 300000 },
            { mois: 'Mar', montant: 200000 },
            { mois: 'Avr', montant: 150000 },
            { mois: 'Mai', montant: 200000 },
            { mois: 'Juin', montant: 150000 }
          ],
          topProduits: [
            { nom: 'Sac en raphia', ventes: 12 },
            { nom: 'Panier en osier', ventes: 8 },
            { nom: 'Chapeau traditionnel', ventes: 4 }
          ],
          stockRestant: [
            { produit: 'Sac en raphia', stock: 15 },
            { produit: 'Panier en osier', stock: 8 },
            { produit: 'Chapeau traditionnel', stock: 5 },
            { produit: 'Nappe brodée', stock: 10 }
          ]
        }), 500)
      );
    }

    // Implémentation pour l'appel API réel
    const response = await fetch(`${API_CONFIG.API_URL}/stats/artisan/${artisanId}/`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error(`Erreur API: ${response.statusText}`);
    }
    
    return response.json();
  }
};