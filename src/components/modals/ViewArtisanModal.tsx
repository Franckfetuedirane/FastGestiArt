import React from 'react';
import { ArtisanProfile } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';

interface ViewArtisanModalProps {
  artisan: ArtisanProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewArtisanModal: React.FC<ViewArtisanModalProps> = ({
  artisan,
  isOpen,
  onClose,
}) => {
  if (!artisan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'artisan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-primary/5 rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarImage src={artisan.photo} alt={artisan.prenom} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                {artisan.prenom[0]}{artisan.nom[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">
                {artisan.prenom} {artisan.nom}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {artisan.specialite}
              </Badge>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{artisan.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{artisan.telephone}</span>
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
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{artisan.departement}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {artisan.adresse}
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
                  {artisan.specialite}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Inscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {new Date(artisan.dateInscription).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};