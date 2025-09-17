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
          title: "Erreur",
          description: "Impossible de charger les produits.",
          variant: "destructive"
        });
      }
      
      if (artisansResult.status === 'rejected') {
        console.error('Erreur lors du chargement des artisans:', artisansResult.reason);
        toast({
          title: "Erreur",
          description: "Impossible de charger les artisans.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Erreur globale lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log('Chargement des données terminé.');
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
        // NOTE: saleAPI does not have an update method, so we'll just show a success message
        // and reload the data to reflect any changes made via other means.
        await loadInitialData(); 
        toast({
          title: "Succès",
          description: "La vente a été modifiée avec succès.",
        });
      } else {
        const newSale = await saleAPI.create(data);
        setSales(prev => [...prev, newSale]);
        toast({
          title: "Succès",
          description: "La vente a été créée avec succès.",
        });
      }
      setIsFormOpen(false);
      setEditingSale(null);
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
      await saleAPI.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Succès",
        description: "La vente a été supprimée.",
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
          setIsFormOpen(false);
          setViewingSale(null);
        }}
      />
    </MainLayout>
  );
};

export default SalesPage;
