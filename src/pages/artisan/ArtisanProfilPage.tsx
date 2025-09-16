import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ArtisanProfile } from '@/types';
import { artisanAPI } from '@/services/api';
import { toast } from 'sonner';

export const ArtisanProfilPage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ArtisanProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<ArtisanProfile>>({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            if (!user?.id) {
                console.error('Aucun utilisateur connecté');
                toast.error('Aucun utilisateur connecté');
                return;
            }

            console.log('Chargement du profil pour l\'utilisateur:', user.id);
            
            // Récupérer le nom complet de l'utilisateur
            const fullName = user.nom && user.prenom 
                ? `${user.prenom} ${user.nom}` 
                : user.nom || user.prenom || 'Utilisateur';
            
            try {
                // Essayer de récupérer le profil existant ou d'en créer un nouveau
                const data = await artisanAPI.getById(user.id, user.email, fullName);
                console.log('Profil chargé avec succès:', data);
                setProfile(data);
                setEditedProfile(data);
            } catch (error) {
                console.error('Erreur lors du chargement/création du profil:', error);
                // Créer un profil par défaut en cas d'échec
                const defaultProfile: ArtisanProfile = {
                    id: user.id,
                    nom: user.nom || '',
                    prenom: user.prenom || '',
                    specialite: 'Non spécifiée',
                    telephone: user.telephone || '',
                    email: user.email || '',
                    adresse: user.adresse || '',
                    departement: user.departement || '',
                    dateInscription: new Date().toISOString(),
                    photo: '',
                    dateCreation: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                console.log('Création d\'un profil par défaut:', defaultProfile);
                setProfile(defaultProfile);
                setEditedProfile(defaultProfile);
                
                // Sauvegarder le profil par défaut
                try {
                    // Créer un FormData à partir de l'objet profile
                    const formData = new FormData();
                    Object.entries(defaultProfile).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            formData.append(key, String(value));
                        }
                    });
                    
                    await artisanAPI.create(formData);
                    toast.success('Profil créé avec succès');
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde du profil par défaut:', saveError);
                    toast.error('Erreur lors de la création du profil');
                }
            }
        } catch (error) {
            console.error('Erreur inattendue lors du chargement du profil:', error);
            toast.error('Une erreur inattendue est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile(profile || {});
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile(profile || {});
    };

    const handleSave = async () => {
        try {
            // En mode lecture seule, on ne peut pas sauvegarder
            toast.info('La modification du profil est gérée par l\'administrateur');
            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const handleInputChange = (field: keyof ArtisanProfile, value: string) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (isLoading) {
        return (
            <MainLayout
                title="Mon Profil"
                subtitle="Consultez vos informations personnelles"
            >
                <div className="space-y-6">
                    <Card className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-64 bg-muted rounded"></div>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout
            title="Mon Profil"
            subtitle="Consultez vos informations personnelles"
        >
            <div className="space-y-6">
                {/* Profile Header */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-6 w-6" />
                                <span>Informations personnelles</span>
                            </CardTitle>
                            {!isEditing ? (
                                <Button variant="outline" onClick={handleEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Consulter
                                </Button>
                            ) : (
                                <div className="flex space-x-2">
                                    <Button variant="outline" onClick={handleCancel}>
                                        <X className="h-4 w-4 mr-2" />
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Sauvegarder
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Photo de profil */}
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                                {profile?.photo ? (
                                    <img
                                        src={profile.photo}
                                        alt="Photo de profil"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">
                                    {profile?.nom} {profile?.prenom}
                                </h3>
                                <p className="text-muted-foreground">{profile?.specialite}</p>
                                <Badge variant="outline" className="mt-2">
                                    Artisan
                                </Badge>
                            </div>
                        </div>

                        {/* Informations personnelles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nom">Nom</Label>
                                    {isEditing ? (
                                        <Input
                                            id="nom"
                                            value={editedProfile.nom || ''}
                                            onChange={(e) => handleInputChange('nom', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{profile?.nom}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="prenom">Prénom</Label>
                                    {isEditing ? (
                                        <Input
                                            id="prenom"
                                            value={editedProfile.prenom || ''}
                                            onChange={(e) => handleInputChange('prenom', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{profile?.prenom}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">{profile?.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    {isEditing ? (
                                        <Input
                                            id="telephone"
                                            value={editedProfile.telephone || ''}
                                            onChange={(e) => handleInputChange('telephone', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{profile?.telephone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="specialite">Spécialité</Label>
                                    {isEditing ? (
                                        <Input
                                            id="specialite"
                                            value={editedProfile.specialite || ''}
                                            onChange={(e) => handleInputChange('specialite', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{profile?.specialite}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="departement">Département</Label>
                                    {isEditing ? (
                                        <Input
                                            id="departement"
                                            value={editedProfile.departement || ''}
                                            onChange={(e) => handleInputChange('departement', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{profile?.departement}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="adresse">Adresse</Label>
                                    {isEditing ? (
                                        <Textarea
                                            id="adresse"
                                            value={editedProfile.adresse || ''}
                                            onChange={(e) => handleInputChange('adresse', e.target.value)}
                                            disabled
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">{profile?.adresse}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="dateInscription">Date d'inscription</Label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {profile?.dateInscription ?
                                                new Date(profile.dateInscription).toLocaleDateString('fr-FR') :
                                                'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Note d'information */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note :</strong> La modification de votre profil est gérée par l'administrateur.
                                Contactez l'administration pour toute modification de vos informations personnelles.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques du profil */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {profile?.dateInscription ?
                                            Math.floor((new Date().getTime() - new Date(profile.dateInscription).getTime()) / (1000 * 60 * 60 * 24)) :
                                            0
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground">Jours d'activité</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <User className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">Actif</p>
                                    <p className="text-sm text-muted-foreground">Statut du compte</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">{profile?.departement || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">Zone d'activité</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default ArtisanProfilPage;
