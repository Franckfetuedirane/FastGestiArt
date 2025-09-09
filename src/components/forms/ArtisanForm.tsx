import React from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArtisanProfile } from '@/types';

const artisanSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  specialite: z.string().min(2, 'La spécialité doit contenir au moins 2 caractères'),
  telephone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Adresse email invalide'),
  adresse: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  departement: z.string().min(2, 'Le département doit contenir au moins 2 caractères'),
  photo: z.string().url('URL de photo invalide').optional().or(z.literal('')),
});

type ArtisanFormData = z.infer<typeof artisanSchema>;

interface ArtisanFormProps {
  artisan?: ArtisanProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ArtisanProfile, 'id' | 'dateInscription'>) => Promise<void>;
  isLoading?: boolean;
}

export const ArtisanForm: React.FC<ArtisanFormProps> = ({
  artisan,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<ArtisanFormData>({
    resolver: zodResolver(artisanSchema),
    defaultValues: {
      nom: artisan?.nom || '',
      prenom: artisan?.prenom || '',
      specialite: artisan?.specialite || '',
      telephone: artisan?.telephone || '',
      email: artisan?.email || '',
      adresse: artisan?.adresse || '',
      departement: artisan?.departement || '',
      photo: artisan?.photo || '',
    },
  });

  const handleSubmit = async (data: ArtisanFormData) => {
    await onSubmit({
      nom: data.nom,
      prenom: data.prenom,
      specialite: data.specialite,
      telephone: data.telephone,
      email: data.email,
      adresse: data.adresse,
      departement: data.departement,
      photo: data.photo || '/api/placeholder/150/150',
    });
    form.reset();
    onClose();
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
                  <FormLabel>URL de la photo (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
                {isLoading ? 'Enregistrement...' : artisan ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};