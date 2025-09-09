import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sale, Product } from '@/types';
import { productsAPI } from '@/services/apiService';

const saleSchema = z.object({
  productId: z.string().min(1, 'Veuillez sélectionner un produit'),
  clientNom: z.string().min(2, 'Le nom du client doit contenir au moins 2 caractères'),
  quantite: z.number().min(1, 'La quantité doit être supérieure à 0'),
  dateDVente: z.string().min(1, 'Veuillez sélectionner une date'),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  sale?: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Sale, 'id' | 'numeroFacture' | 'montantTotal' | 'product' | 'artisan'>) => Promise<void>;
  isLoading?: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  sale,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: sale?.productId || '',
      clientNom: sale?.clientNom || '',
      quantite: sale?.quantite || 1,
      dateDVente: sale?.dateDVente?.split('T')[0] || new Date().toISOString().split('T')[0],
    },
  });

  const watchedProductId = form.watch('productId');
  const watchedQuantite = form.watch('quantite');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productsAPI.getAll();
        setProducts(productsData.filter(p => p.stock > 0)); // Only products with stock
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    };

    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id === watchedProductId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [watchedProductId, products]);

  const handleSubmit = async (data: SaleFormData) => {
    if (!selectedProduct) return;

    await onSubmit({
      productId: data.productId,
      artisanId: selectedProduct.artisanId,
      clientNom: data.clientNom,
      quantite: data.quantite,
      dateDVente: data.dateDVente,
    });
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setSelectedProduct(null);
    onClose();
  };

  const getTotalAmount = () => {
    if (!selectedProduct || !watchedQuantite) return 0;
    return selectedProduct.prix * watchedQuantite;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sale ? 'Modifier la vente' : 'Nouvelle vente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.nom} - {product.prix.toLocaleString()} FCFA (Stock: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientNom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du client</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom complet du client" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max={selectedProduct?.stock || 999}
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground">
                        Stock disponible: {selectedProduct.stock}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateDVente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de vente</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedProduct && watchedQuantite > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prix unitaire:</span>
                  <span className="font-medium">{selectedProduct.prix.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantité:</span>
                  <span className="font-medium">{watchedQuantite}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    {getTotalAmount().toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedProduct || watchedQuantite > (selectedProduct?.stock || 0)} 
                className="btn-primary"
              >
                {isLoading ? 'Enregistrement...' : sale ? 'Modifier' : 'Créer la vente'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};