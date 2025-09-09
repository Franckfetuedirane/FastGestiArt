import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import CategorieTable from '@/components/crud/CategorieTable';
import { ViewCategoryModal } from '@/components/modals/ViewCategoryModal';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { Category } from '@/types';
import { categoriesAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des catégories.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleView = (category: Category) => {
    setViewingCategory(category);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Catégories" subtitle="Gérez les catégories de produits">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, data);
        setCategories(prev => prev.map(c => 
          c.id === editingCategory.id 
            ? { ...c, ...data }
            : c
        ));
        toast({
          title: "Catégorie modifiée",
          description: `${data.name} a été modifiée avec succès.`,
        });
      } else {
        const newCategory = await categoriesAPI.create(data);
        setCategories(prev => [...prev, newCategory]);
        toast({
          title: "Catégorie créée",
          description: `${data.name} a été créée avec succès.`,
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la catégorie.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout 
      title="Gestion des Catégories" 
      subtitle="Gérez les catégories de produits"
    >
      <CategorieTable
        categories={categories}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
      
      <ViewCategoryModal
        category={viewingCategory}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
      
      <CategoryForm
        category={editingCategory}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
};

export default CategoriesPage;