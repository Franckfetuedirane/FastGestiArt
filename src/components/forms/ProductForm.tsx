  import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
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
import { Textarea } from '@/components/ui/textarea';
import { Product, ArtisanProfile, Category } from '@/types';
import { artisanAPI, categoryAPI } from '@/services/api';
import { ImageUpload } from '@/components/ui/image-upload';
import { toBase64 } from '@/lib/utils';

const productSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
    
  categorie: z.string()
    .min(1, 'Veuillez sélectionner une catégorie')
    .max(100, 'La catégorie ne peut pas dépasser 100 caractères'),
    
  prix: z.number()
    .min(0.01, 'Le prix doit être supérieur à 0')
    .max(1000000, 'Le prix ne peut pas dépasser 1 000 000'),
    
  stock: z.number()
    .int('Le stock doit être un nombre entier')
    .min(0, 'Le stock ne peut pas être négatif')
    .max(1000000, 'Le stock ne peut pas dépasser 1 000 000'),
    
  artisanId: z.string()
    .min(1, 'Veuillez sélectionner un artisan'),
    
  image: z.union([
    z.string().url('URL d\'image invalide'),
    z.instanceof(File, { message: 'Veuillez sélectionner un fichier valide' })
      .refine(file => file.size < 5000000, 'L\'image doit faire moins de 5MB')
      .refine(
        file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        'Seuls les formats JPEG, PNG et WebP sont acceptés'
      ),
    z.literal('')
  ]).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'dateCreation' | 'artisan'>) => Promise<void>;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: '',
      description: '',
      categorie: '',
      prix: 0,
      stock: 0,
      artisanId: '',
      image: '',
    },
  });

  useEffect(() => {
    const fetchArtisansAndCategories = async () => {
      try {
        const [artisansData, categoriesData] = await Promise.all([
          artisanAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        setArtisans(artisansData);
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les artisans et les catégories.',
          variant: 'destructive',
        });
      }
    };
    fetchArtisansAndCategories();
  }, []);

  useEffect(() => {
    if (product) {
      form.reset({
        nom: product.nom,
        description: product.description,
        categorie: product.categorie,
        prix: product.prix,
        stock: product.stock,
        artisanId: product.artisanId,
        image: product.image || '',
      });
    } else {
      form.reset({
        nom: '',
        description: '',
        categorie: '',
        prix: 0,
        stock: 0,
        artisanId: '',
        image: '',
      });
    }
  }, [product, form]);

  const handleImageUpload = async (file: File) => {
    try {
      const base64Image = await toBase64(file);
      form.setValue('image', base64Image, { shouldValidate: true });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: 'Erreur d\'upload',
        description: 'Impossible de convertir l\'image.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveImage = () => {
    form.setValue('image', '', { shouldValidate: true });
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    try {
      let imageUrl = '';
      if (formData.image instanceof File) {
        try {
          imageUrl = await toBase64(formData.image);
        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'image:', error);
          throw new Error('Échec de l\'upload de l\'image. Veuillez réessayer.');
        }
      } else if (typeof formData.image === 'string') {
        imageUrl = formData.image;
      }

      const productData = {
        ...formData,
        image: imageUrl,
      };

      await onSubmit(productData);
      handleClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier le produit' : 'Créer un nouveau produit'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Vase en argile" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artisanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artisan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un artisan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {artisans.map((artisan) => (
                          <SelectItem key={artisan.id} value={artisan.id}>
                            {artisan.prenom} {artisan.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le produit..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
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
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock initial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image du produit</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <ImageUpload
                        currentImage={field.value as string}
                        onUpload={handleImageUpload}
                        onRemove={handleRemoveImage}
                      />
                      <div className="text-sm text-muted-foreground">
                        Téléchargez une image ou entrez une URL (max 5MB, JPG/PNG/WebP)
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
