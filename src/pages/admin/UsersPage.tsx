import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { UserTable } from '@/components/crud/UserTable';
import { User } from '@/types';
import { usersAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La création d'administrateur sera bientôt disponible.",
    });
  };

  const handleEdit = (user: User) => {
    toast({
      title: "Fonctionnalité à venir",
      description: `Modification de l'utilisateur "${user.email}" sera bientôt disponible.`,
    });
  };

  const handleView = (user: User) => {
    toast({
      title: "Détails",
      description: `Visualisation des détails de l'utilisateur "${user.email}".`,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Utilisateurs" subtitle="Gérez les administrateurs de la plateforme">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Gestion des Utilisateurs" 
      subtitle="Gérez les administrateurs de la plateforme"
    >
      <UserTable
        users={users}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
};

export default UsersPage;