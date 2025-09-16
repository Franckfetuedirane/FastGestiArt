import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SaleTable } from '@/components/crud/SaleTable';
import { SaleForm } from '@/components/forms/SaleForm';
import { ViewSaleModal } from '@/components/modals/ViewSaleModal';
import { Sale, Product, ArtisanProfile } from '@/types';
import { saleAPI } from '@/services/api/saleAPI';
import { artisanAPI } from '@/services/api/artisanAPI';
import { productAPI } from '@/services/api/productAPI';
import { useToast } from '@/hooks/use-toast';

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    console.log('Début du chargement des données des ventes...');
    setIsLoading(true);
    
    try {
      // Chargement en parallèle des ventes, produits et artisans avec gestion des erreurs individuelles
      console.log('Chargement des données des ventes...');
      const [salesResult, productsResult, artisansResult] = await Promise.allSettled([
        saleAPI.getAll(),
        productAPI.getAll(),
        artisanAPI.getAll()
      ]);
      
      // Gestion des résultats
      const salesData = salesResult.status === 'fulfilled' ? salesResult.value : [];
      const productsData = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const artisansData = artisansResult.status === 'fulfilled' ? artisansResult.value : [];
      
      console.log('Données chargées:', { 
        sales: salesData.length, 
        products: productsData.length, 
        artisans: artisansData.length 
      });
      
      setSales(salesData);
      setProducts(productsData);
      setArtisans(artisansData);
      
      if (salesResult.status === 'rejected') {
        console.error('Erreur lors du chargement des ventes:', salesResult.reason);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ventes.",
          variant: "destructive"
        });
      }
      
      if (productsResult.status === 'rejected') {
        console.error('Erreur lors du chargement des produits:', productsResult.reason);
        toast({
          title: "Avertissement",
          description: "Certains produits n'ont pas pu être chargés.",
          variant: "destructive"
        });
      }
      
      if (artisansResult.status === 'rejected') {
        console.error('Erreur lors du chargement des artisans:', artisansResult.reason);
        toast({
          title: "Avertissement",
          description: "Certains artisans n'ont pas pu être chargés.",
          variant: "destructive"
        });
      }
      
      console.log(`${productsData.length} produits chargés`);
      console.log(`${artisansData.length} artisans chargés`);
      
      // S'assurer que chaque vente a bien un tableau d'items et des valeurs par défaut
      const validatedSales = salesData.map(sale => ({
        ...sale,
        items: Array.isArray(sale.items) ? sale.items : [],
        clientNom: sale.clientNom || 'Client inconnu',
        montantTotal: sale.montantTotal || 0,
        statut: (sale.statut as 'en_attente' | 'validee' | 'annulee') || 'validee',
        dateDVente: sale.dateDVente || new Date().toISOString(),
        modePaiement: sale.modePaiement || 'especes' as const,
        artisanId: sale.artisanId || ''
      } as Sale));
      
      setSales(validatedSales);
      setProducts(productsData);
      setArtisans(artisansData);
      
      // Vérifier les données chargées
      if (validatedSales.length === 0) {
        console.warn('Aucune vente trouvée');
      }
      
    } catch (error) {
      console.error('Erreur inattendue lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors du chargement des données.",
        variant: "destructive"
      });
    } finally {
      console.log('Fin du chargement des données des ventes');
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSale(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setIsFormOpen(true);
  };

  const handleView = (sale: Sale) => {
    setViewingSale(sale);
    setIsViewOpen(true);
  };

  const handleSubmit = async (data: Omit<Sale, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingSale) {
        // Pour la mise à jour, on supprime l'ancienne vente et on en crée une nouvelle
        await saleAPI.delete(editingSale.id);
        const newSale = await saleAPI.create(data);
        setSales(prev => prev.map(s => s.id === editingSale.id ? newSale : s));
        toast({
          title: "Vente mise à jour",
          description: `La vente a été mise à jour avec succès.`,
        });
      } else {
        // Création d'une nouvelle vente
        const newSale = await saleAPI.create(data);
        setSales(prev => [...prev, newSale]);
        toast({
          title: "Vente créée",
          description: `La vente a été créée avec succès.`,
        });
      }
      setIsFormOpen(false);
      setEditingSale(null);
      await loadInitialData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la vente:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la vente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await saleAPI.delete(id);
      setSales(prev => prev.filter(sale => sale.id !== id));
      toast({
        title: "Vente supprimée",
        description: "La vente a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la vente:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la vente.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Ventes" subtitle="Suivez toutes les transactions">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Gestion des Ventes" 
      subtitle="Suivez toutes les transactions"
    >
      <SaleTable
        sales={sales}
        products={products}
        artisans={artisans}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <SaleForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSale(null);
        }}
        onSubmit={handleSubmit}
        sale={editingSale}
        products={products}
        artisans={artisans}
      />

      <ViewSaleModal
        sale={viewingSale}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingSale(null);
        }}
      />
    </MainLayout>
  );
};

export default SalesPage;

// import React, { useState, useEffect } from 'react';
// import { MainLayout } from '@/components/layout/MainLayout';
// import { SaleTable } from '@/components/crud/SaleTable';
// import { SaleForm } from '@/components/forms/SaleForm';
// import { ViewSaleModal } from '@/components/modals/ViewSaleModal';
// import { Sale, Product, ArtisanProfile } from '@/types';
// import { saleService } from '@/services/saleService';
// import { artisansAPI } from '@/services/apiService';
// import { useToast } from '@/hooks/use-toast';
// import { productService } from '@/services/productService';

// const SalesPage: React.FC = () => {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [isViewOpen, setIsViewOpen] = useState(false);
//   const [editingSale, setEditingSale] = useState<Sale | null>(null);
//   const [viewingSale, setViewingSale] = useState<Sale | null>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     console.log('[SalesPage] Début du chargement des données initiales');
//     setIsLoading(true);
    
//     try {
//       // Charger d'abord les produits et les artisans
//       console.log('[SalesPage] Chargement des produits et des artisans...');
//       const [productsData, artisansData] = await Promise.all([
//         productService.getAll(),
//         artisansAPI.getAll()
//       ]);
      
//       console.log(`[SalesPage] ${productsData.length} produits chargés`);
//       console.log(`[SalesPage] ${artisansData.length} artisans chargés`);
      
//       setProducts(productsData);
//       setArtisans(artisansData);
      
//       // Ensuite, charger les ventes
//       console.log('[SalesPage] Chargement des ventes...');
//       const salesData = await saleService.getAll();
//       console.log(`[SalesPage] ${salesData.length} ventes chargées`);
      
//       setSales(salesData);
      
//     } catch (error) {
//       console.error('[SalesPage] Erreur lors du chargement des données:', error);
//       toast({
//         title: "Erreur",
//         description: "Impossible de charger les données. Veuillez réessayer.",
//         variant: "destructive"
//       });
//     } finally {
//       console.log('[SalesPage] Fin du chargement des données');
//       setIsLoading(false);
//     }
//   };

//   const handleAdd = () => {
//     setEditingSale(null);
//     setIsFormOpen(true);
//   };

//   const handleEdit = (sale: Sale) => {
//     setEditingSale(sale);
//     setIsFormOpen(true);
//   };

//   const handleView = (sale: Sale) => {
//     setViewingSale(sale);
//     setIsViewOpen(true);
//   };

//   const handleSubmit = async (data: Omit<Sale, 'id'>) => {
//     try {
//       if (editingSale) {
//         // Mise à jour
//         const updatedSale = await saleService.update(editingSale.id, data);
//         setSales(prev => prev.map(s => s.id === editingSale.id ? updatedSale : s));
//         toast({
//           title: "Succès",
//           description: "La vente a été modifiée avec succès.",
//         });
//       } else {
//         // Création
//         const newSale = await saleService.create(data);
//         setSales(prev => [...prev, newSale]);
//         toast({
//           title: "Succès",
//           description: "La vente a été créée avec succès.",
//         });
//       }
//       setIsFormOpen(false);
//       setEditingSale(null);
//     } catch (error) {
//       toast({
//         title: "Erreur",
//         description: "Impossible de sauvegarder la vente.",
//         variant: "destructive"
//       });
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await saleService.delete(id);
//       setSales(prev => prev.filter(s => s.id !== id));
//       toast({
//         title: "Succès",
//         description: "La vente a été supprimée et le stock a été mis à jour.",
//       });
//     } catch (error) {
//       toast({
//         title: "Erreur",
//         description: "Impossible de supprimer la vente.",
//         variant: "destructive"
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <MainLayout title="Gestion des Ventes" subtitle="Suivez toutes les transactions">
//         <div className="animate-pulse space-y-4">
//           <div className="h-64 bg-muted rounded-lg"></div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout 
//       title="Gestion des Ventes" 
//       subtitle="Suivez toutes les transactions"
//     >
//       <SaleTable
//         sales={sales}
//         products={products}
//         artisans={artisans}
//         onAdd={handleAdd}
//         onEdit={handleEdit}
//         onView={handleView}
//         onDelete={handleDelete}
//       />

//       <SaleForm
//         isOpen={isFormOpen}
//         onClose={() => {
//           setIsFormOpen(false);
//           setEditingSale(null);
//         }}
//         onSubmit={handleSubmit}
//         sale={editingSale}
//         products={products}
//         artisans={artisans}
//       />

//       <ViewSaleModal
//         sale={viewingSale}
//         isOpen={isViewOpen}
//         onClose={() => {
//           setIsViewOpen(false);
//           setViewingSale(null);
//         }}
//       />
//     </MainLayout>
//   );
// };

// export default SalesPage;