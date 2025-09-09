import React, { useState } from 'react';
import { Sale } from '@/types';
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
import { Edit, Trash2, Eye, Search, Plus, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaleTableProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
  onView: (sale: Sale) => void;
  onAdd: () => void;
  onViewInvoice: (sale: Sale) => void;
}

export const SaleTable: React.FC<SaleTableProps> = ({
  sales,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onViewInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredSales = sales.filter(sale =>
    sale.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.artisan?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.artisan?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, numeroFacture: string) => {
    onDelete(id);
    toast({
      title: "Vente supprimée",
      description: `La vente ${numeroFacture} a été supprimée avec succès.`,
    });
  };

  const getTotalVentes = () => {
    return filteredSales.reduce((total, sale) => total + sale.montantTotal, 0);
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {filteredSales.length}
            </div>
            <p className="text-sm text-muted-foreground">Ventes totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {getTotalVentes().toLocaleString()} FCFA
            </div>
            <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {Math.round(getTotalVentes() / filteredSales.length || 0).toLocaleString()} FCFA
            </div>
            <p className="text-sm text-muted-foreground">Panier moyen</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Historique des Ventes ({filteredSales.length})</CardTitle>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une vente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 md:w-64"
                />
              </div>
              <Button onClick={onAdd} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle vente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune vente trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="font-medium">{sale.numeroFacture}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{sale.clientNom}</div>
                      </TableCell>
                      <TableCell>
                        {sale.product && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-md">
                              <AvatarImage src={sale.product.image} alt={sale.product.nom} />
                              <AvatarFallback className="bg-gradient-secondary text-secondary-foreground rounded-md text-xs">
                                <FileText className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{sale.product.nom}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {sale.artisan && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={sale.artisan.photo} alt={sale.artisan.prenom} />
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                                {sale.artisan.prenom[0]}{sale.artisan.nom[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {sale.artisan.prenom} {sale.artisan.nom}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {sale.quantite}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.montantTotal.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {new Date(sale.dateDVente).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewInvoice(sale)}
                            title="Voir la facture"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(sale)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(sale)}
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
                                  Êtes-vous sûr de vouloir supprimer la vente "{sale.numeroFacture}" ? 
                                  Cette action est irréversible et supprimera également la facture associée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(sale.id, sale.numeroFacture)}
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
    </div>
  );
};