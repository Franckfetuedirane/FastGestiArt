import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtisanTable } from '@/components/crud/ArtisanTable';
import { ArtisanProfile } from '@/types';
import { artisansAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const ArtisansPage: React.FC = () => {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    toast({
      title: "Fonctionnalité à venir",
      description: "La création d'artisan sera bientôt disponible.",
    });
  };

  const handleEdit = (artisan: ArtisanProfile) => {
    toast({
      title: "Fonctionnalité à venir",
      description: `Modification de ${artisan.prenom} ${artisan.nom} sera bientôt disponible.`,
    });
  };

  const handleView = (artisan: ArtisanProfile) => {
    toast({
      title: "Détails",
      description: `Visualisation des détails de ${artisan.prenom} ${artisan.nom}.`,
    });
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
    </MainLayout>
  );
};

export default ArtisansPage;