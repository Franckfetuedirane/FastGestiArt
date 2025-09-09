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

interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewUserModal({ user, isOpen, onClose }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={user.profile?.photo || '/api/placeholder/150/150'} 
                alt={user.profile?.prenom || user.email} 
              />
              <AvatarFallback>
                {user.profile ? 
                  `${user.profile.prenom[0]}${user.profile.nom[0]}` : 
                  user.email.substring(0, 2).toUpperCase()
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {user.profile ? 
                  `${user.profile.prenom} ${user.profile.nom}` : 
                  'Administrateur'
                }
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <h4 className="font-medium mb-2">Rôle</h4>
              <Badge>{user.role}</Badge>
            </div>
            
            {user.profile && (
              <>
                <div>
                  <h4 className="font-medium mb-2">Spécialité</h4>
                  <p>{user.profile.specialite}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact</h4>
                  <p>{user.profile.telephone}</p>
                  <p>{user.profile.adresse}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Date d'inscription</h4>
                  <p>{new Date(user.profile.dateInscription).toLocaleDateString('fr-FR')}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}