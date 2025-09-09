import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SaleTable } from '@/components/crud/SaleTable';
import { SaleForm } from '@/components/forms/SaleForm';
import { ViewSaleModal } from '@/components/modals/ViewSaleModal';
import { Sale, Product, ArtisanProfile } from '@/types';
import { saleService } from '@/services/saleService';
import { artisansAPI } from '@/services/apiService';
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
    try {
      setIsLoading(true);
      const [salesData, productsData, artisansData] = await Promise.all([
        saleService.getAll(),
        productService.getAll(),
        artisansAPI.getAll()
      ]);
      setSales(salesData);
      setProducts(productsData);
      setArtisans(artisansData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive"
      });
    } finally {
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