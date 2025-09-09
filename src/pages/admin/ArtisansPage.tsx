import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtisanTable } from '@/components/crud/ArtisanTable';
import { ViewArtisanModal } from '@/components/modals/ViewArtisanModal';
import { ArtisanForm } from '@/components/forms/ArtisanForm';
import { ArtisanProfile } from '@/types';
import { artisansAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const ArtisansPage: React.FC = () => {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingArtisan, setViewingArtisan] = useState<ArtisanProfile | null>(null);
  const [editingArtisan, setEditingArtisan] = useState<ArtisanProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadArtisans();
  }, []);

  const loadArtisans = async () => {
    try {
      const data = await artisansAPI.getAll();
      setArtisans(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des artisans.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingArtisan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (artisan: ArtisanProfile) => {
    setEditingArtisan(artisan);
    setIsFormOpen(true);
  };

  const handleView = (artisan: ArtisanProfile) => {
    setViewingArtisan(artisan);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await artisansAPI.delete(id);
      setArtisans(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'artisan.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Artisans" subtitle="Gérez la communauté d'artisans">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (data: Omit<ArtisanProfile, 'id' | 'dateInscription'>) => {
    setIsSubmitting(true);
    try {
      if (editingArtisan) {
        await artisansAPI.update(editingArtisan.id, data);
        setArtisans(prev => prev.map(a => 
          a.id === editingArtisan.id 
            ? { ...a, ...data }
            : a
        ));
        toast({
          title: "Artisan modifié",
          description: `${data.prenom} ${data.nom} a été modifié avec succès.`,
        });
      } else {
        const newArtisan = await artisansAPI.create(data);
        setArtisans(prev => [...prev, newArtisan]);
        toast({
          title: "Artisan créé",
          description: `${data.prenom} ${data.nom} a été créé avec succès.`,
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'artisan.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout 
      title="Gestion des Artisans" 
      subtitle="Gérez la communauté d'artisans"
    >
      <ArtisanTable
        artisans={artisans}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
      
      <ViewArtisanModal
        artisan={viewingArtisan}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
      
      <ArtisanForm
        artisan={editingArtisan}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
};

export default ArtisansPage;