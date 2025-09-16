import { API_CONFIG } from '@/config/api.config';
import { ArtisanProfile } from '@/types';
import { localStorageService } from '../localStorageService';

// Fonction utilitaire pour formater la date au format ISO
const formatDate = (date: Date): string => date.toISOString();

// Fonction utilitaire pour convertir FormData en objet
const formDataToObject = (formData: FormData): Record<string, any> => {
  const object: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Ne pas écraser les valeurs existantes avec des valeurs vides
    if (value !== '' && value !== undefined) {
      object[key] = value;
    }
  });
  return object;
};

export const artisanAPI = {
  // Récupérer tous les artisans
  getAll: async (): Promise<ArtisanProfile[]> => {
    console.log('Début du chargement des artisans...');
    
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        try {
          const artisans = localStorageService.getArtisans();
          console.log('Artisans chargés depuis le localStorage:', artisans.length);
          setTimeout(() => {
            console.log('Résolution de la promesse avec les artisans');
            resolve(artisans);
          }, 500);
        } catch (error) {
          console.error('Erreur lors de la récupération des artisans depuis le localStorage:', error);
          resolve([]); // Retourner un tableau vide en cas d'erreur
        }
      });
    }
    
    // Implémentation pour une API réelle
    try {
      console.log('Chargement des artisans depuis l\'API...');
      const response = await fetch(`${API_CONFIG.API_URL}/artisans/`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur API (${response.status}): ${errorText}`);
        throw new Error(`Erreur API: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Artisans chargés depuis l\'API:', data.length);
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des artisans depuis l\'API:', error);
      throw error;
    }
  },

  // Récupérer un artisan par son ID, avec création automatique si nécessaire
  getById: async (id: string, email?: string, fullName?: string): Promise<ArtisanProfile> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            // Récupérer les artisans existants
            let artisans = localStorageService.getArtisans();
            let artisan = artisans.find(a => a.id === id);
            
            // Si l'artisan n'existe pas, on le crée automatiquement
            if (!artisan && email) {
              // Extraire le nom et le prénom du nom complet si fourni
              const [prenom, ...noms] = (fullName || 'Nouvel Artisan').split(' ');
              const nom = noms.join(' ') || 'Artisan';
              
              const newArtisan: ArtisanProfile = {
                id,
                nom,
                prenom,
                specialite: 'Non spécifiée',
                telephone: '',
                email: email || '',
                adresse: '',
                departement: '',
                dateInscription: new Date().toISOString(),
                photo: 'https://randomuser.me/api/portraits/lego/1.jpg',
                dateCreation: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              // Ajouter le nouvel artisan à la liste
              artisans.push(newArtisan);
              localStorageService.saveArtisans(artisans);
              artisan = newArtisan;
              
              console.log('Nouveau profil artisan créé automatiquement:', newArtisan);
            }
            
            if (!artisan) {
              throw new Error('Impossible de créer ou de trouver le profil artisan');
            }
            
            resolve(artisan);
          } catch (error) {
            console.error('Erreur lors de la récupération/création du profil artisan:', error);
            throw error;
          }
        }, 500);
      });
    }
    
    // Implémentation pour une API réelle
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/artisans/${id}/`);
      
      // Si l'artisan n'existe pas (404), on le crée
      if (response.status === 404 && email) {
        const newArtisan = await fetch(`${API_CONFIG.API_URL}/artisans/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: id,
            email,
            businessName: fullName || 'Nouvel Artisan',
            isActive: true
          })
        });
        
        if (!newArtisan.ok) {
          throw new Error('Erreur lors de la création du profil artisan');
        }
        
        return newArtisan.json();
      }
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du profil artisan:', error);
      throw error;
    }
  },

  // Créer un nouvel artisan
  create: async (data: FormData): Promise<ArtisanProfile> => {
    const formDataObj = formDataToObject(data);
    const now = formatDate(new Date());
    
    const newArtisan: ArtisanProfile = {
      id: `art-${Date.now()}`,
      nom: formDataObj.nom || '',
      prenom: formDataObj.prenom || '',
      specialite: formDataObj.specialite || '',
      telephone: formDataObj.telephone || '',
      email: formDataObj.email || '',
      adresse: formDataObj.adresse || '',
      departement: formDataObj.departement || '',
      photo: formDataObj.photo || '',
      dateInscription: now,
      dateCreation: now,
      updatedAt: now
    };

    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve) => {
        const artisans = localStorageService.getArtisans();
        artisans.push(newArtisan);
        localStorageService.saveArtisans(artisans);
        setTimeout(() => resolve(newArtisan), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/artisans/`, {
      method: 'POST',
      body: data,
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Mettre à jour un artisan existant
  update: async (id: string, data: FormData): Promise<ArtisanProfile> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const artisans = localStorageService.getArtisans();
        const index = artisans.findIndex(a => a.id === id);
        
        if (index === -1) {
          reject(new Error('Artisan non trouvé'));
          return;
        }
        
        const formDataObj = formDataToObject(data);
        const updatedArtisan = { 
          ...artisans[index],
          ...formDataObj,
          updatedAt: formatDate(new Date()) 
        };
        
        artisans[index] = updatedArtisan;
        localStorageService.saveArtisans(artisans);
        
        setTimeout(() => resolve(updatedArtisan), 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/artisans/${id}/`, {
      method: 'PUT',
      body: data,
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
    return response.json();
  },

  // Supprimer un artisan
  delete: async (id: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return new Promise((resolve, reject) => {
        const artisans = localStorageService.getArtisans();
        const index = artisans.findIndex(a => a.id === id);
        
        if (index === -1) {
          reject(new Error('Artisan non trouvé'));
          return;
        }
        
        // Vérifier si l'artisan est référencé par des produits
        const products = localStorageService.getProducts();
        const isReferenced = products.some(p => p.artisanId === id);
        
        if (isReferenced) {
          reject(new Error('Impossible de supprimer cet artisan car il est associé à des produits'));
          return;
        }
        
        artisans.splice(index, 1);
        localStorageService.saveArtisans(artisans);
        
        setTimeout(resolve, 500);
      });
    }
    
    // Implémentation pour une API réelle
    const response = await fetch(`${API_CONFIG.API_URL}/artisans/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error(`Erreur API: ${response.statusText}`);
  },
};