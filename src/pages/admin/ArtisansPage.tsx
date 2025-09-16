import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtisanTable } from '@/components/crud/ArtisanTable';
import { ViewArtisanModal } from '@/components/modals/ViewArtisanModal';
import { ArtisanForm } from '@/components/forms/ArtisanForm';
import { ArtisanProfile } from '@/types';
import { artisanAPI } from '@/services/api/artisanAPI';
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
      console.log('Chargement des artisans...');
      const data = await artisanAPI.getAll();
      console.log('Artisans chargés:', data);
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
      await artisanAPI.delete(id);
      setArtisans(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Succès",
        description: "L'artisan a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'artisan:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'artisan.",
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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Créer un objet avec les champs de l'artisan
      const artisanData = {
        nom: formData.get('nom') as string,
        prenom: formData.get('prenom') as string,
        specialite: formData.get('specialite') as string,
        telephone: formData.get('telephone') as string,
        email: formData.get('email') as string,
        adresse: formData.get('adresse') as string,
        departement: formData.get('departement') as string,
        photo: formData.get('photo') as string,
        statut: 'actif' as const,
        dateInscription: new Date().toISOString(),
      };

      if (editingArtisan) {
        // Mise à jour d'un artisan existant
        const updatedArtisan = await artisanAPI.update(editingArtisan.id, formData);
        setArtisans(prev => prev.map(a => a.id === editingArtisan.id ? updatedArtisan : a));
        toast({
          title: "Artisan mis à jour",
          description: `${artisanData.prenom} ${artisanData.nom} a été mis à jour avec succès.`,
        });
      } else {
        // Création d'un nouvel artisan
        formData.append('id', `artisan-${Date.now()}`);
        formData.append('dateInscription', new Date().toISOString());
        formData.append('statut', 'actif');
        
        const newArtisan = await artisanAPI.create(formData);
        setArtisans(prev => [...prev, newArtisan]);
        toast({
          title: "Artisan créé",
          description: `${artisanData.prenom} ${artisanData.nom} a été créé avec succès.`,
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