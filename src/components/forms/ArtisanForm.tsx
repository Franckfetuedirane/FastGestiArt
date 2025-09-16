import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArtisanProfile } from '@/types';
import { ImageUpload } from '@/components/ui/image-upload';

// Fonction utilitaire pour convertir un fichier en base64
const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const artisanSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  specialite: z.string().min(2, 'La spécialité doit contenir au moins 2 caractères'),
  telephone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Adresse email invalide'),
  adresse: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  departement: z.string().min(2, 'Le département doit contenir au moins 2 caractères'),
  photo: z.union([
    z.string().url('URL de photo invalide'),
    z.instanceof(File, { message: 'Veuillez sélectionner un fichier valide' })
      .refine(file => file.size < 5000000, 'L\'image doit faire moins de 5MB')
      .refine(
        file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        'Seuls les formats JPEG, PNG et WebP sont acceptés'
      ),
    z.literal('')
  ]).optional(),
});

type ArtisanFormData = z.infer<typeof artisanSchema>;

interface ArtisanFormProps {
  artisan?: ArtisanProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
}

export const ArtisanForm: React.FC<ArtisanFormProps> = ({
  artisan,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof artisanSchema>>({
    resolver: zodResolver(artisanSchema),
    defaultValues: artisan ? {
      nom: artisan.nom,
      prenom: artisan.prenom,
      specialite: artisan.specialite,
      telephone: artisan.telephone,
      email: artisan.email,
      adresse: artisan.adresse,
      departement: artisan.departement,
      photo: artisan.photo,
    } : {
      nom: '',
      prenom: '',
      specialite: '',
      telephone: '',
      email: '',
      adresse: '',
      departement: '',
      photo: '',
    },
  });
  
  const handleImageUpload = async (file: File) => {
    try {
      const base64Image = await toBase64(file);
      form.setValue('photo', base64Image, { shouldValidate: true });
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du téléchargement de l\'image',
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveImage = () => {
    form.setValue('photo', '', { shouldValidate: true });
  };

  const handleSubmit = async (formData: ArtisanFormData) => {
    try {
      setIsSubmitting(true);
      
      // Gérer l'upload de l'image si c'est un fichier
      let photoUrl = formData.photo || '';
      if (formData.photo instanceof File) {
        try {
          // Simuler un upload
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation de délai
          photoUrl = await toBase64(formData.photo);
        } catch (error) {
          console.error('Erreur lors de l\'upload de l\'image:', error);
          throw new Error('Échec de l\'upload de l\'image. Veuillez réessayer.');
        }
      }
      
      await onSubmit({
        nom: formData.nom,
        prenom: formData.prenom,
        specialite: formData.specialite,
        telephone: formData.telephone,
        email: formData.email,
        adresse: formData.adresse,
        departement: formData.departement,
        photo: photoUrl || '/api/placeholder/150/150',
      });
      
      form.reset();
      onClose();
      
      toast({
        title: 'Succès',
        description: artisan ? 'L\'artisan a été mis à jour avec succès.' : 'L\'artisan a été créé avec succès.',
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde de l\'artisan.',
        variant: 'destructive',
        duration: 5000,
      });
      
      throw error;
    } finally {
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
            {artisan ? 'Modifier l\'artisan' : 'Nouvel artisan'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom de l'artisan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'artisan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spécialité</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Poterie, Tissage, Sculpture..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+221 XX XXX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Département</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Dakar, Thiès, Saint-Louis..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adresse complète de l'artisan"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo de l'artisan</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <ImageUpload
                        currentImage={typeof field.value === 'string' ? field.value : ''}
                        onUpload={handleImageUpload}
                        onRemove={handleRemoveImage}
                      />
                      <div className="text-sm text-muted-foreground">
                        Téléchargez une image ou entrez une URL (max 5MB, JPG/PNG/WebP)
                      </div>
                      <Input 
                        placeholder="Ou entrez une URL d'image..." 
                        value={typeof field.value === 'string' ? field.value : ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-2"
                      />
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
              <Button type="submit" disabled={isLoading || isSubmitting} className="btn-primary">
                {(isLoading || isSubmitting) ? 'Enregistrement...' : artisan ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};