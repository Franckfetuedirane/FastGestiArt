import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductTable } from '@/components/crud/ProductTable';
import { Product } from '@/types';
import { productsAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des produits.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La création de produit sera bientôt disponible.",
    });
  };

  const handleEdit = (product: Product) => {
    toast({
      title: "Fonctionnalité à venir",
      description: `Modification du produit "${product.nom}" sera bientôt disponible.`,
    });
  };

  const handleView = (product: Product) => {
    toast({
      title: "Détails",
      description: `Visualisation des détails du produit "${product.nom}".`,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Produits" subtitle="Gérez tous les produits de la plateforme">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Gestion des Produits" 
      subtitle="Gérez tous les produits de la plateforme"
    >
      <ProductTable
        products={products}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
};

export default ProductsPage;