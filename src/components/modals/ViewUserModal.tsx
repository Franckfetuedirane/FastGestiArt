import React from 'react';
import { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Shield, Briefcase } from 'lucide-react';

interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="default" className="bg-gradient-primary">
          <Shield className="h-3 w-3 mr-1" />
          Administrateur
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <UserIcon className="h-3 w-3 mr-1" />
        Artisan
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-primary/5 rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={user.profile?.photo || '/api/placeholder/150/150'} 
                alt={user.profile?.prenom || user.email} 
              />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                {user.profile ? 
                  `${user.profile.prenom[0]}${user.profile.nom[0]}` :
                  user.email.substring(0, 2).toUpperCase()
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">
                {user.profile ? 
                  `${user.profile.prenom} ${user.profile.nom}` : 
                  'Administrateur'
                }
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(user.role)}
                <Badge variant="default" className="bg-green-500">
                  Actif
                </Badge>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {user.email}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Rôle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {user.role === 'admin' ? 'Administrateur' : 'Artisan'}
                </div>
              </CardContent>
            </Card>

            {user.profile && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {user.profile.telephone}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Spécialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {user.profile.specialite}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localisation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="text-sm font-medium">
                      {user.profile.departement}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.profile.adresse}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date d'inscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {new Date(user.profile.dateInscription).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Additional Info for Admin Users */}
          {user.role === 'admin' && !user.profile && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Informations administrateur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compte administrateur avec accès complet au système de gestion.
                  Peut gérer tous les artisans, produits, ventes et utilisateurs.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};