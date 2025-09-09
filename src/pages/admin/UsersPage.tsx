import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { UserTable } from '@/components/crud/UserTable';
import { ViewUserModal } from '@/components/modals/ViewUserModal';
import { UserForm } from '@/components/forms/UserForm';
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { mockUsers } from '@/data/mockData';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setUsers(mockUsers);
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
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (data: Partial<User>) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update existing user
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? { ...user, ...data } : user
        ));
        toast({
          title: "Succès",
          description: "Utilisateur modifié avec succès.",
        });
      } else {
        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...data as User
        };
        setUsers(prev => [...prev, newUser]);
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès.",
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'utilisateur.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Utilisateurs" subtitle="Gérez les utilisateurs de la plateforme">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Gestion des Utilisateurs" 
      subtitle="Gérez les utilisateurs de la plateforme"
    >
      <UserTable
        users={users}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
      
      <ViewUserModal
        user={viewingUser}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />
      
      <UserForm
        user={editingUser}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
};

export default UsersPage;