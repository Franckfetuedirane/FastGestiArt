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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';
import { ImageUpload } from '@/components/ui/image-upload';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const userSchema = z.object({
  // Informations de base
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  
  // Mot de passe (obligatoire pour les nouveaux utilisateurs, optionnel pour la mise à jour)
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  confirmPassword: z.string().optional(),
  
  // Rôles et permissions
  role: z.enum(['admin', 'artisan', 'user']),
  isActive: z.boolean().default(true),
  
  // Informations supplémentaires
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  
  // Image de profil
  avatar: z.union([
    z.string().url('URL d\'image invalide'),
    z.instanceof(File).refine(file => file.size < 5000000, "L'image doit faire moins de 5MB"),
    z.literal('')
  ]).optional(),
  
  // Validation conditionnelle pour le mot de passe
}).refine((data) => {
  // Si c'est une création ou que le mot de passe est fourni, il doit être valide
  if (!data.password) return true;
  return data.password.length >= 6;
}, {
  message: 'Le mot de passe doit contenir au moins 6 caractères',
  path: ['password']
}).refine((data) => {
  // Vérification de la correspondance des mots de passe
  if (!data.password) return true;
  return data.password === data.confirmPassword;
}, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'user',
      isActive: user?.isActive ?? true,
      address: user?.address || '',
      city: user?.city || '',
      postalCode: user?.postalCode || '',
      country: user?.country || '',
      notes: user?.notes || '',
      avatar: user?.avatar || '',
      password: '',
      confirmPassword: '',
    },
  });

  // Réinitialiser le formulaire lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'user',
        isActive: user.isActive ?? true,
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        notes: user.notes || '',
        avatar: user.avatar || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'user',
        isActive: true,
        address: '',
        city: '',
        postalCode: '',
        country: '',
        notes: '',
        avatar: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, form]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('avatar', reader.result as string, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    form.setValue('avatar', '', { shouldValidate: true });
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      // Préparer les données à soumettre
      const submitData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        isActive: data.isActive,
        address: data.address || undefined,
        city: data.city || undefined,
        postalCode: data.postalCode || undefined,
        country: data.country || undefined,
        notes: data.notes || undefined,
        avatar: typeof data.avatar === 'string' ? data.avatar : '',
      };

      // Inclure le mot de passe uniquement s'il est fourni
      if (data.password) {
        submitData.password = data.password;
      }

      await onSubmit(submitData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colonne de gauche - Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations personnelles</h3>
                
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <div className="mb-2">
                        <ImageUpload
                          currentImage={field.value as string}
                          onUpload={handleImageUpload}
                          onRemove={handleRemoveImage}
                        />
                      </div>
                      <FormLabel className="text-center">Photo de profil</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="jean.dupont@example.com" 
                          {...field}
                          disabled={!!user}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+33 6 12 34 56 78" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Colonne du milieu - Rôle et statut */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Rôle et accès</h3>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Administrateur</span>
                              <Badge variant="outline" className="ml-2">Accès complet</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="artisan">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Artisan</span>
                              <Badge variant="outline" className="ml-2">Accès limité</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Utilisateur</span>
                              <Badge variant="outline" className="ml-2">Accès restreint</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Compte actif
                        </FormLabel>
                        <FormDescription>
                          Désactivez pour empêcher la connexion de cet utilisateur
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!user && (
                  <>
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2">Mot de passe</h4>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mot de passe</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmer le mot de passe</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Colonne de droite - Adresse et notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adresse</h3>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="123 rue de l'exemple" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="75000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informations supplémentaires..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {user ? 'Mise à jour...' : 'Création...'}
                  </span>
                ) : user ? 'Mettre à jour' : 'Créer l\'utilisateur'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};