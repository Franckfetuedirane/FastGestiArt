import React from 'react';
import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, DollarSign, Archive, Calendar, User, Tag } from 'lucide-react';

interface ViewProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!product) return null;

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: 'destructive' as const, text: 'Rupture de stock' };
    if (stock <= 5) return { variant: 'secondary' as const, text: 'Stock faible' };
    return { variant: 'default' as const, text: 'En stock' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du produit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Header */}
          <div className="flex items-start gap-4 p-4 bg-gradient-secondary/5 rounded-lg">
            <Avatar className="h-24 w-24 rounded-md">
              <AvatarImage src={product.image} alt={product.nom} />
              <AvatarFallback className="bg-gradient-secondary text-secondary-foreground rounded-md">
                <Package2 className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{product.nom}</h3>
              <p className="text-muted-foreground mt-1">{product.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{product.categorie}</Badge>
                <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Prix de vente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {product.prix.toLocaleString()} FCFA
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Stock disponible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {product.stock} unité{product.stock > 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {product.categorie}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de création
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {new Date(product.dateCreation).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Artisan Information */}
          {product.artisan && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Artisan créateur
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.artisan.photo} alt={product.artisan.prenom} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {product.artisan.prenom[0]}{product.artisan.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {product.artisan.prenom} {product.artisan.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.artisan.specialite}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.artisan.departement}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};