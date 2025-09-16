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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fonction pour convertir un fichier en base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: product?.nom || '',
      description: product?.description || '',
      categorie: product?.categorie || '',
      prix: product?.prix || 0,
      stock: product?.stock || 0,
      artisanId: product?.artisanId || '',
      image: product?.image || '',
    },
  });
  
  // Réinitialiser le formulaire lorsque le produit change
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

  // Charger les données nécessaires
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isOpen) return;

      setIsLoadingData(true);

      try {
        const [categoriesData, artisansData] = await Promise.all([
          categoryAPI.getCategories(),
          artisanAPI.getArtisans(),
        ]);

        if (!isMounted) return;

        setArtisans(artisansData);
        setCategories(categoriesData);

        const formValues: Partial<ProductFormData> = {};

        if (artisansData.length > 0) {
          const defaultArtisanId = product?.artisanId || artisansData[0]?.id || '';
          formValues.artisanId = defaultArtisanId;
        }

        if (product?.categorie) {
          formValues.categorie = product.categorie;
        } else if (categoriesData.length > 0) {
          formValues.categorie = categoriesData[0].name;
        }

        form.reset({
          ...form.getValues(),
          ...formValues,
        });

        if (formValues.artisanId) form.trigger('artisanId');
        if (formValues.categorie) form.trigger('categorie');

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données nécessaires pour le formulaire.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    if (isOpen) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, product, form]);

  const handleImageUpload = async (file: File) => {
    try {
      const base64Image = await toBase64(file);
      form.setValue('image', base64Image, { shouldValidate: true });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
    }
  };
  
  const handleRemoveImage = () => {
    form.setValue('image', '', { shouldValidate: true });
  };

  const handleSubmit = async (formData: ProductFormData) => {
    let loadingToast: { dismiss: () => void } | null = null;
    
    try {
      setIsSubmitting(true);
      
      // Afficher un toast de chargement
      loadingToast = toast({
        title: 'Traitement en cours',
        description: 'Enregistrement du produit...',
        duration: 0, // Ne pas fermer automatiquement
      });
      
      // Gérer l'upload de l'image si c'est un fichier
      let imageUrl = '';
      if (formData.image instanceof File) {
        try {
          // Simuler un upload
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de délai
          imageUrl = URL.createObjectURL(formData.image);
        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'image:', error);
          throw new Error('Échec de l\'upload de l\'image. Veuillez réessayer.');
        }
      } else if (typeof formData.image === 'string') {
        imageUrl = formData.image;
      }
      
      // Préparer les données du produit avec des valeurs par défaut pour les champs requis
      const productData = {
        nom: formData.nom || 'Sans nom',
        description: formData.description || '',
        categorie: formData.categorie || 'Autre',
        prix: formData.prix || 0,
        stock: formData.stock || 0,
        artisanId: formData.artisanId || '',
        image: imageUrl,
        dateCreation: product?.dateCreation || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Appeler la fonction de soumission fournie par le parent
      await onSubmit(productData);
      
      // Fermer le formulaire
      onClose();
      
      // Afficher un message de succès
      toast({
        title: 'Succès',
        description: product ? 'Le produit a été mis à jour avec succès.' : 'Le produit a été créé avec succès.',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      
      // Afficher un message d'erreur approprié
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde du produit.',
        variant: 'destructive',
        duration: 5000,
      });
      
      // Relancer l'erreur pour que le composant parent puisse la gérer si nécessaire
      throw error;
    } finally {
      // Fermer le toast de chargement
      if (loadingToast) {
        loadingToast.dismiss();
      }
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du produit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description détaillée du produit"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
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
                name="artisanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artisan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un artisan" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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