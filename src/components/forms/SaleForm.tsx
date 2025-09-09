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
  isLoading?: boolean;
}

interface SaleItem {
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
  isLoading = false,
}) => {
  const [clientName, setClientName] = useState('');
  const [artisanId, setArtisanId] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{
    productId: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  }]);

  // Filtrer les produits par artisan
  const filteredProducts = products.filter(product => 
    product.artisanId === artisanId
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

  const calculateTotal = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...saleItems];
    newItems[index] = {
      ...newItems[index],
      productId,
      unitPrice: product?.prix || 0,
      totalPrice: (product?.prix || 0) * newItems[index].quantity
    };
    setSaleItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...saleItems];
    newItems[index] = {
      ...newItems[index],
      quantity,
      totalPrice: newItems[index].unitPrice * quantity
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
    if (!artisan) return;

    const saleData: Omit<Sale, 'id'> = {
      clientNom: clientName,
      artisanId: artisanId,
      artisan: artisan,
      dateDVente: new Date().toISOString(),
      numeroFacture: `FACT-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
      montantTotal: calculateTotal(saleItems),
      items: saleItems.map(item => ({
        productId: item.productId,
        product: products.find(p => p.id === item.productId)!,
        quantite: item.quantity,
        prixUnitaire: item.unitPrice,
        sousTotal: item.totalPrice
      }))
    };

    await onSubmit(saleData);
    resetForm();
  };

  const resetForm = () => {
    setClientName('');
    setArtisanId('');
    setSaleItems([{
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
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