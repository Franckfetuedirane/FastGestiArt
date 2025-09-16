import { Sale, SaleItem, Product } from '@/types';
import { productAPI } from './api/productAPI';
import { localStorageService } from './localStorageService';
import { API_CONFIG } from '@/config/api.config';

// Fonction utilitaire pour générer un numéro de facture
const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const sales = localStorageService.getSales();
  const count = sales.length + 1;
  return `FACT-${year}-${String(count).padStart(4, '0')}`;
};

export const saleService = {
  // Récupérer toutes les ventes
  getAll: async (artisanId?: string): Promise<Sale[]> => {
    console.log(`[saleService] Récupération des ventes${artisanId ? ` pour l'artisan ${artisanId}` : ''}`);
    
    if (API_CONFIG.USE_MOCK) {
      console.log('[saleService] Mode MOCK activé, lecture depuis le localStorage');
      
      return new Promise((resolve, reject) => {
        try {
          // Récupérer les ventes depuis le localStorage
          let sales = localStorageService.getSales();
          console.log(`[saleService] ${sales.length} ventes trouvées dans le localStorage`);
          
          // Vérifier si des ventes existent
          if (!sales || !Array.isArray(sales)) {
            console.warn('[saleService] Aucune vente trouvée ou format invalide dans le localStorage');
            sales = [];
          }
          
          // S'assurer que chaque vente a bien un tableau d'items et des valeurs par défaut
          sales = sales.map(sale => ({
            id: sale.id || `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            numeroFacture: sale.numeroFacture || `FACT-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`,
            dateDVente: sale.dateDVente || new Date().toISOString(),
            client: sale.client || 'Client non spécifié',
            montantTotal: sale.montantTotal || 0,
            statut: sale.statut || 'terminée',
            modePaiement: sale.modePaiement || 'espèces',
            artisanId: sale.artisanId || 'artisan-inconnu',
            items: Array.isArray(sale.items) ? sale.items.map(item => ({
              productId: item.productId || 'produit-inconnu',
              quantite: item.quantite || 1,
              prixUnitaire: item.prixUnitaire || 0,
              remise: item.remise || 0,
              total: item.total || (item.prixUnitaire || 0) * (item.quantite || 1) * (1 - (item.remise || 0) / 100)
            })) : [],
            createdAt: sale.createdAt || new Date().toISOString(),
            updatedAt: sale.updatedAt || new Date().toISOString()
          }));
          
          // Filtrer par artisan si un ID est fourni
          if (artisanId) {
            const countBefore = sales.length;
            sales = sales.filter(sale => sale.artisanId === artisanId);
            console.log(`[saleService] Filtrage des ventes pour l'artisan ${artisanId}: ${countBefore} -> ${sales.length}`);
          }
          
          // Trier par date de vente (du plus récent au plus ancien)
          sales.sort((a, b) => new Date(b.dateDVente).getTime() - new Date(a.dateDVente).getTime());
          console.log(`[saleService] ${sales.length} ventes après tri`);
          
          // Simuler un délai de chargement
          setTimeout(() => {
            console.log(`[saleService] Renvoi de ${sales.length} ventes`);
            console.log('[saleService] Détails des ventes:', JSON.stringify(sales, null, 2));
            resolve(sales);
          }, 100);
          
        } catch (error) {
          console.error('[saleService] Erreur lors de la récupération des ventes:', error);
          // Retourner un tableau vide en cas d'erreur
          resolve([]);
        }
      });
    }
    
    // Implémentation pour une API réelle
    try {
      const url = artisanId 
        ? `${API_CONFIG.API_URL}/ventes/?artisan_id=${artisanId}`
        : `${API_CONFIG.API_URL}/ventes/`;
      
      console.log(`[saleService] Appel API: GET ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[saleService] Erreur API (${response.status}): ${errorText}`);
        throw new Error(`Erreur API: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[saleService] ${data.length} ventes reçues de l'API`);
      return data;
      
    } catch (error) {
      console.error('[saleService] Erreur lors de la récupération des ventes:', error);
      throw error;
    }
  },

  // Récupérer une vente par son ID
  getById: async (id: string): Promise<Sale> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const sales = localStorageService.getSales();
        const sale = sales.find(s => s.id === id);
        
        setTimeout(() => {
          if (sale) {
            resolve(sale);
          } else {
            reject(new Error('Vente non trouvée'));
          }
        }, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/ventes/${id}/`);
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Créer une nouvelle vente
  create: async (data: Omit<Sale, 'id' | 'numeroFacture'>): Promise<Sale> => {
    // Vérifier le stock avant de procéder à la vente
    const stockChecks = await Promise.all(
      data.items.map(async (item) => {
        try {
          const product = await productAPI.getById(item.productId);
          return {
            productId: item.productId,
            hasEnoughStock: product.stock >= item.quantite,
            availableStock: product.stock,
            requestedQuantity: item.quantite
          };
        } catch (error) {
          return {
            productId: item.productId,
            hasEnoughStock: false,
            availableStock: 0,
            requestedQuantity: item.quantite
          };
        }
      })
    );

    // Vérifier si tous les produits ont assez de stock
    const outOfStockItems = stockChecks.filter(item => !item.hasEnoughStock);
    if (outOfStockItems.length > 0) {
      const errorMessages = outOfStockItems.map(item => 
        `Produit ${item.productId}: Stock insuffisant (${item.availableStock} disponible, ${item.requestedQuantity} demandé)`
      );
      throw new Error(`Stock insuffisant pour les produits suivants :\n${errorMessages.join('\n')}`);
    }

    // Mettre à jour le stock des produits
    await Promise.all(
      data.items.map(item => 
        productAPI.updateStock(item.productId, -item.quantite)
      )
    );

    const newSale: Sale = {
      ...data,
      id: `sale-${Date.now()}`,
      numeroFacture: generateInvoiceNumber(),
    };

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const sales = localStorageService.getSales();
        sales.unshift(newSale); // Ajouter au début du tableau pour un affichage plus récent en premier
        localStorageService.saveSales(sales);
        setTimeout(() => resolve(newSale), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/ventes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale),
    });
    
    if (!response.ok) {
      // En cas d'erreur, restaurer le stock
      await Promise.all(
        data.items.map(item => 
          productAPI.updateStock(item.productId, item.quantite)
        )
      );
      throw new Error(`Erreur API: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Mettre à jour une vente existante
  update: async (id: string, data: Partial<Omit<Sale, 'id' | 'numeroFacture'>>): Promise<Sale> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise(async (resolve, reject) => {
        try {
          const sales = localStorageService.getSales();
          const index = sales.findIndex(s => s.id === id);
          
          if (index === -1) {
            reject(new Error('Vente non trouvée'));
            return;
          }
          
          const oldSale = sales[index];
          
          // Si les articles ont changé, mettre à jour le stock
          if (data.items) {
            // Restaurer l'ancien stock
            await Promise.all(
              oldSale.items.map(item =>
                productAPI.updateStock(item.productId, item.quantite)
              )
            );
            
            // Mettre à jour avec le nouveau stock
            await Promise.all(
              data.items.map(item =>
                productAPI.updateStock(item.productId, -item.quantite)
              )
            );
          }
          
          // Mettre à jour la vente
          const updatedSale = { ...oldSale, ...data, id };
          sales[index] = updatedSale;
          localStorageService.saveSales(sales);
          
          setTimeout(() => resolve(updatedSale), 500);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/ventes/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Supprimer une vente
  delete: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise(async (resolve, reject) => {
        try {
          const sales = localStorageService.getSales();
          const index = sales.findIndex(s => s.id === id);
          
          if (index === -1) {
            reject(new Error('Vente non trouvée'));
            return;
          }
          
          const sale = sales[index];
          
          // Restaurer le stock
          await Promise.all(
            sale.items.map(item =>
              productAPI.updateStock(item.productId, item.quantite)
            )
          );
          
          // Supprimer la vente
          sales.splice(index, 1);
          localStorageService.saveSales(sales);
          
          setTimeout(resolve, 500);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/ventes/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
  },

  // Obtenir les statistiques de vente
  getStats: async (artisanId?: string): Promise<{
    totalSales: number;
    totalRevenue: number;
    salesByMonth: Array<{ month: string; count: number; revenue: number }>;
    topProducts: Array<{ product: Product; quantity: number; revenue: number }>;
  }> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        let sales = localStorageService.getSales();
        
        // Filtrer par artisan si un ID est fourni
        if (artisanId) {
          sales = sales.filter(sale => sale.artisanId === artisanId);
        }
        
        // Calculer le nombre total de ventes
        const totalSales = sales.length;
        
        // Calculer le chiffre d'affaires total
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.montantTotal, 0);
        
        // Calculer les ventes par mois
        const salesByMonthMap = new Map<string, { month: string; count: number; revenue: number }>();
        
        sales.forEach(sale => {
          const date = new Date(sale.dateDVente);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
          
          if (!salesByMonthMap.has(monthKey)) {
            salesByMonthMap.set(monthKey, { 
              month: monthName, 
              count: 0, 
              revenue: 0 
            });
          }
          
          const monthData = salesByMonthMap.get(monthKey)!;
          monthData.count += 1;
          monthData.revenue += sale.montantTotal;
        });
        
        const salesByMonth = Array.from(salesByMonthMap.values())
          .sort((a, b) => a.month.localeCompare(b.month));
        
        // Calculer les produits les plus vendus
        const productSales = new Map<string, { product: Product; quantity: number; revenue: number }>();
        
        sales.forEach(sale => {
          sale.items.forEach(item => {
            if (!productSales.has(item.productId)) {
              // Dans une vraie application, on récupérerait le produit depuis l'API
              // Ici, on crée un objet partiel pour la démo
              const product: Product = {
                id: item.productId,
                nom: `Produit ${item.productId}`,
                description: '',
                categorie: '',
                prix: 0,
                stock: 0,
                artisanId: '',
                image: '',
                dateCreation: ''
              };
              productSales.set(item.productId, { product, quantity: 0, revenue: 0 });
            }
            
            const productData = productSales.get(item.productId)!;
            productData.quantity += item.quantite;
            productData.revenue += item.quantite * (item.prixUnitaire || 0);
          });
        });
        
        const topProducts = Array.from(productSales.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5); // Top 5 des produits
        
        setTimeout(() => resolve({
          totalSales,
          totalRevenue,
          salesByMonth,
          topProducts,
        }), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const url = artisanId 
      ? `${API_CONFIG.API_URL}/ventes/statistiques/?artisan_id=${artisanId}`
      : `${API_CONFIG.API_URL}/ventes/statistiques/`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },
};