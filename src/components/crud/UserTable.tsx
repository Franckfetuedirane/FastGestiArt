import React, { useState } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Eye, Search, UserPlus, Shield, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onView: (user: User) => void;
  onAdd: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onView,
  onAdd
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.profile && (
      user.profile.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleDelete = (id: string, email: string) => {
    if (id === currentUser?.id) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas supprimer votre propre compte.",
        variant: "destructive"
      });
      return;
    }
    onDelete(id);
    toast({
      title: "Utilisateur supprimé",
      description: `L'utilisateur ${email} a été supprimé avec succès.`,
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="bg-gradient-primary">
            <Shield className="h-3 w-3 mr-1" />
            Administrateur
          </Badge>
        );
      case 'secondary_admin':
        return (
          <Badge variant="default" className="bg-blue-500">
            <Shield className="h-3 w-3 mr-1" />
            Admin Secondaire
          </Badge>
        );
      case 'artisan':
      default:
        return (
          <Badge variant="secondary">
            <UserIcon className="h-3 w-3 mr-1" />
            Artisan
          </Badge>
        );
    }
  };

  return (
    <Card className="card-elegant">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Gestion des Utilisateurs ({filteredUsers.length})</CardTitle>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 md:w-64"
              />
            </div>
            <Button onClick={onAdd} className="btn-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter Admin
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={user.profile?.photo || '/api/placeholder/150/150'} 
                            alt={user.profile?.prenom || user.email} 
                          />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {user.profile ? 
                              `${user.profile.prenom[0]}${user.profile.nom[0]}` :
                              user.email.substring(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.profile ? 
                              `${user.profile.prenom} ${user.profile.nom}` : 
                              'Administrateur'
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.profile?.specialite || 'Gestion système'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500 hover:bg-green-500/90">
                        Actif
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.dateCreation ? (
                        <div className="flex flex-col">
                          <span>{new Date(user.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : user.profile?.dateInscription ? (
                        <div className="flex flex-col">
                          <span>{new Date(user.profile.dateInscription).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.profile.dateInscription).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Non spécifiée</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'utilisateur "{user.email}" ? 
                                Cette action est irréversible et supprimera également toutes les données associées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id, user.email)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};