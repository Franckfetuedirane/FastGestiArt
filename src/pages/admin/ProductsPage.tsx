import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductTable } from '@/components/crud/ProductTable';
import { ProductForm } from '@/components/forms/ProductForm';
import { Product, Category, ArtisanProfile } from '@/types';
import { productAPI } from '@/services/api/productAPI';
import { categoryAPI } from '@/services/api/categoryAPI';
import { artisanAPI } from '@/services/api/artisanAPI';
import { useToast } from '@/hooks/use-toast';
import { productsAPI } from '@/services/apiService';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [productsData, categoriesData, artisansData] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        artisanAPI.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
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
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Omit<Product, 'id' | 'dateCreation'>) => {
    try {
      if (editingProduct) {
        // Pour la mise à jour, on supprime l'ancien produit et on en crée un nouveau
        await productAPI.delete(editingProduct.id);
        const newProduct = await productAPI.create(data);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
        toast({
          title: "Succès",
          description: "Le produit a été modifié avec succès.",
        });
      } else {
        const newProduct = await productAPI.create(data);
        setProducts(prev => [...prev, newProduct]);
        toast({
          title: "Succès",
          description: "Le produit a été créé avec succès.",
        });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Succès",
        description: "Le produit a été supprimé avec succès.",
      });
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
        onDelete={handleDelete}
      />

      <ProductForm
        product={editingProduct}
        categories={categories}
        artisans={artisans}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
      />
    </MainLayout>
  );
};

export default ProductsPage;