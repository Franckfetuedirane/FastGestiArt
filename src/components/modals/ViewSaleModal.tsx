import React from 'react';
import { Sale } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, User, Package2, Calendar, DollarSign, Hash, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewSaleModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice?: (sale: Sale) => void;
}

export const ViewSaleModal: React.FC<ViewSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
  onViewInvoice,
}) => {
  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la vente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sale Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-accent/5 rounded-lg">
            <div>
              <h3 className="text-2xl font-semibold">{sale.numeroFacture}</h3>
              <p className="text-muted-foreground">Client: {sale.clientNom}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {sale.montantTotal.toLocaleString()} FCFA
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(sale.dateDVente).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Numéro de facture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm">
                  {sale.numeroFacture}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {sale.clientNom}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Quantité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {sale.quantite} unité{sale.quantite > 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de vente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {new Date(sale.dateDVente).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Information */}
          {sale.product && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package2 className="h-4 w-4" />
                  Produit vendu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage src={sale.product.image} alt={sale.product.nom} />
                    <AvatarFallback className="bg-gradient-secondary text-secondary-foreground rounded-md">
                      <Package2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{sale.product.nom}</p>
                    <p className="text-sm text-muted-foreground">{sale.product.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{sale.product.categorie}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Prix unitaire</p>
                    <p className="font-semibold">{sale.product.prix.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Artisan Information */}
          {sale.artisan && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Artisan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sale.artisan.photo} alt={sale.artisan.prenom} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {sale.artisan.prenom[0]}{sale.artisan.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {sale.artisan.prenom} {sale.artisan.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.artisan.specialite}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.artisan.departement}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onViewInvoice && (
              <Button onClick={() => onViewInvoice(sale)} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Voir la facture
              </Button>
            )}
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};