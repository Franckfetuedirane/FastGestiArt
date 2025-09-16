import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SaleTable } from '@/components/crud/SaleTable';
import { SaleForm } from '@/components/forms/SaleForm';
import { ViewSaleModal } from '@/components/modals/ViewSaleModal';
import { Sale, Product, ArtisanProfile } from '@/types';
import { saleService } from '@/services/saleService';
import { artisanAPI } from '@/services/api/artisanAPI';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/productService';

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
      // Chargement en parallèle des ventes, produits et artisans
      const [salesData, productsData, artisansData] = await Promise.all([
        saleService.getAll(),
        productService.getAll(),
        artisanAPI.getAll()
      ]);
      
      console.log(`${salesData.length} ventes chargées`);
      console.log(`${productsData.length} produits chargés`);
      console.log(`${artisansData.length} artisans chargés`);
      
      // S'assurer que chaque vente a bien un tableau d'items
      const validatedSales = salesData.map(sale => ({
        ...sale,
        items: sale.items || []
      }));
      
      setSales(validatedSales);
      setProducts(productsData);
      setArtisans(artisansData);
      
      // Vérifier les données chargées
      if (validatedSales.length === 0) {
        console.warn('Aucune vente trouvée dans le stockage local');
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des ventes. Veuillez réessayer.",
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
    try {
      if (editingSale) {
        // Mise à jour
        const updatedSale = await saleService.update(editingSale.id, data);
        setSales(prev => prev.map(s => s.id === editingSale.id ? updatedSale : s));
        toast({
          title: "Succès",
          description: "La vente a été modifiée avec succès.",
        });
      } else {
        // Création
        const newSale = await saleService.create(data);
        setSales(prev => [...prev, newSale]);
        toast({
          title: "Succès",
          description: "La vente a été créée avec succès.",
        });
      }
      setIsFormOpen(false);
      setEditingSale(null);
      await loadInitialData(); // Recharger les données
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la vente.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await saleService.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Succès",
        description: "La vente a été supprimée et le stock a été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vente.",
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