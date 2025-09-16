import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/types";
import { ImageUpload } from "@/components/ui/image-upload";
import { useEffect } from "react";

const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  description: z.string().optional(),
  image: z.union([
    z.string().url("URL d'image invalide"),
    z.instanceof(File).refine(file => file.size < 5000000, "L'image doit faire moins de 5MB"),
    z.literal('')
  ]).optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading: boolean;
}

export function CategoryForm({ category, isOpen, onClose, onSubmit, isLoading }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      image: category?.image || '',
    },
  });

  // Réinitialiser le formulaire lorsque la catégorie change
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        image: '',
      });
    }
  }, [category, form]);

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      // S'assurer que l'image est une chaîne (et non un objet File)
      const imageUrl = typeof data.image === 'string' ? data.image : '';
      
      await onSubmit({
        name: data.name,
        description: data.description || '',
        image: imageUrl,
      });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };
  
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('image', reader.result as string, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    form.setValue('image', '', { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la catégorie</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Bijoux artisanaux"
                          {...field}
                          disabled={isLoading}
                        />
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
                          placeholder="Décrivez cette catégorie..."
                          className="resize-none"
                          rows={4}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image de la catégorie</FormLabel>
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
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {category ? 'Mise à jour...' : 'Création...'}
                  </span>
                ) : category ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}