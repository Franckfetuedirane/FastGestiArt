import React, { useState } from 'react';
import { ArtisanProfile } from '@/types';
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
import { Edit, Trash2, Eye, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArtisanTableProps {
  artisans: ArtisanProfile[];
  onEdit: (artisan: ArtisanProfile) => void;
  onDelete: (id: string) => void;
  onView: (artisan: ArtisanProfile) => void;
  onAdd: () => void;
}

export const ArtisanTable: React.FC<ArtisanTableProps> = ({
  artisans,
  onEdit,
  onDelete,
  onView,
  onAdd
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredArtisans = artisans.filter(artisan =>
    artisan.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.departement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, nom: string) => {
    onDelete(id);
    toast({
      title: "Artisan supprimé",
      description: `L'artisan ${nom} a été supprimé avec succès.`,
    });
  };

  return (
    <Card className="card-elegant">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Liste des Artisans ({filteredArtisans.length})</CardTitle>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un artisan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 md:w-64"
              />
            </div>
            <Button onClick={onAdd} className="btn-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArtisans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun artisan trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredArtisans.map((artisan) => (
                  <TableRow key={artisan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={artisan.photo} alt={artisan.prenom} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {artisan.prenom[0]}{artisan.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{artisan.prenom} {artisan.nom}</p>
                          <p className="text-sm text-muted-foreground">{artisan.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{artisan.specialite}</Badge>
                    </TableCell>
                    <TableCell>{artisan.telephone}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{artisan.departement}</p>
                        <p className="text-sm text-muted-foreground">{artisan.adresse}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(artisan.dateInscription).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(artisan)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(artisan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'artisan {artisan.prenom} {artisan.nom} ? 
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(artisan.id, `${artisan.prenom} ${artisan.nom}`)}
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