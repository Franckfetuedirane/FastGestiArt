import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ArtisanProfile, Sale } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { format } from 'date-fns';

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Sale, 'id'>) => Promise<void>;
  products: Product[];
  artisans: ArtisanProfile[];
  sale?: Sale | null;
  isLoading?: boolean;
}

// Utiliser l'interface SaleItem du type global
import { SaleItem as GlobalSaleItem } from '@/types';

// Interface locale pour la gestion du formulaire
interface SaleItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  artisans,
  sale = null,
  isLoading = false,
}) => {
  // Déclarer tous les états en premier
  const [clientName, setClientName] = useState('');
  const [artisanId, setArtisanId] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItemForm[]>([{
    productId: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  }]);

  // Fonction pour réinitialiser le formulaire
  const resetForm = React.useCallback(() => {
    setClientName('');
    setArtisanId('');
    setSaleItems([{
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  }, [setClientName, setArtisanId, setSaleItems]);

  // Initialiser le formulaire avec les données de la vente à éditer
  useEffect(() => {
    if (sale) {
      setClientName(sale.clientNom || '');
      setArtisanId(sale.artisanId || '');
      
      // Convertir les items de la vente en format de formulaire
      const initialItems = sale.items?.length > 0 
        ? sale.items.map(item => ({
            productId: item.productId,
            quantity: item.quantite || 1,
            unitPrice: item.prixUnitaire || 0,
            totalPrice: item.montant || 0
          }))
        : [{
            productId: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
          }];
      
      setSaleItems(initialItems);
    } else {
      // Réinitialiser le formulaire pour une nouvelle vente
      resetForm();
    }
  }, [sale, resetForm]);

  // Mémoriser les produits filtrés par artisan
  const filteredProducts = React.useMemo(() => 
    products.filter(product => product.artisanId === artisanId),
    [products, artisanId]
  );

  // Réinitialiser les produits sélectionnés quand l'artisan change
  const handleArtisanChange = (newArtisanId: string) => {
    setArtisanId(newArtisanId);
    // Réinitialiser les produits sélectionnés car ils appartiennent à l'ancien artisan
    setSaleItems([{
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  };

  // Calculer le total de la vente
  const calculateTotal = React.useCallback((items: SaleItemForm[]) => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, []);

  // Mettre à jour le total quand les articles changent
  const totalAmount = React.useMemo(() => 
    calculateTotal(saleItems),
    [saleItems, calculateTotal]
  );

  // Gérer le changement de produit
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newItems = [...saleItems];
    const quantity = newItems[index].quantity || 1;
    const unitPrice = product.prix || 0;
    
    newItems[index] = {
      ...newItems[index],
      productId,
      unitPrice,
      totalPrice: unitPrice * quantity
    };
    
    setSaleItems(newItems);
  };

  // Gérer le changement de quantité
  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const newItems = [...saleItems];
    const productId = newItems[index].productId;
    const product = products.find(p => p.id === productId);
    const unitPrice = product?.prix || newItems[index].unitPrice || 0;
    
    // Vérifier le stock disponible
    const availableStock = product?.stock || 0;
    if (quantity > availableStock) {
      // Afficher une alerte ou limiter la quantité au stock disponible
      quantity = availableStock;
    }
    
    newItems[index] = {
      ...newItems[index],
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity
    };
    
    setSaleItems(newItems);
  };

  const addItem = () => {
    setSaleItems([...saleItems, {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (saleItems.length > 1) {
      const newItems = saleItems.filter((_, i) => i !== index);
      setSaleItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const artisan = artisans.find(a => a.id === artisanId);
    if (!artisan) {
      console.error('Aucun artisan sélectionné');
      return;
    }

    // Vérifier qu'il y a au moins un article valide
    const validItems = saleItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      console.error('Veuillez ajouter au moins un article à la vente');
      return;
    }

    // Convertir les articles du formulaire en format SaleItem
    const items: GlobalSaleItem[] = validItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Produit avec l'ID ${item.productId} introuvable`);
      }

      // Vérifier le stock disponible
      if (product.stock !== undefined && item.quantity > product.stock) {
        throw new Error(`Stock insuffisant pour le produit ${product.nom}. Stock disponible: ${product.stock}`);
      }

      return {
        productId: item.productId,
        product: product,
        quantite: item.quantity,
        prixUnitaire: item.unitPrice,
        montant: item.totalPrice,
        remise: 0 // Par défaut, pas de remise
      };
    });

    // Calculer le montant total
    const montantTotal = items.reduce((sum, item) => sum + item.montant, 0);

    // Préparer les données de la vente
    const saleData: Omit<Sale, 'id'> = {
      clientNom: clientName.trim(),
      artisanId: artisanId,
      artisan: artisan,
      dateDVente: sale?.dateDVente || new Date().toISOString(), // Conserver la date d'origine pour les mises à jour
      numeroFacture: sale?.numeroFacture || `FACT-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
      montantTotal: montantTotal,
      items: items,
      statut: sale?.statut || 'validee',
      modePaiement: sale?.modePaiement || 'especes',
      notes: sale?.notes || ''
    };

    try {
      await onSubmit(saleData);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      // L'erreur sera gérée par le composant parent
      throw error;
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={() => {
      resetForm();
      onClose();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle Vente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du client</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Artisan</label>
              <Select
                value={artisanId}
                onValueChange={handleArtisanChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'artisan" />
                </SelectTrigger>
                <SelectContent>
                  {artisans.map((artisan) => (
                    <SelectItem key={artisan.id} value={artisan.id}>
                      {`${artisan.prenom} ${artisan.nom}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {artisanId ? (
            <div className="space-y-4">
              {saleItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <label className="text-sm font-medium">Produit</label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleProductChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.nom} - {product.prix.toLocaleString()} FCFA
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Quantité</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Prix unitaire</label>
                    <Input
                      value={`${item.unitPrice.toLocaleString()} FCFA`}
                      disabled
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <label className="text-sm font-medium">Total</label>
                    <Input
                      value={`${item.totalPrice.toLocaleString()} FCFA`}
                      disabled
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={saleItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
                disabled={filteredProducts.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Veuillez d'abord sélectionner un artisan
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total : {calculateTotal(saleItems).toLocaleString()} FCFA
            </div>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !artisanId || saleItems[0].productId === ''}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};