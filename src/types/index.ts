// Types pour l'application GestiArt

export interface ArtisanProfileDetails {
  id: string;
  userId: string;
  specialite: string;
  description: string;
  anneesExperience: number;
  statut: 'actif' | 'inactif' | 'en_attente';
}

export interface User {
  id: string;
  email: string;
  user_type: 'admin' | 'artisan' | 'secondary_admin';
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  dateCreation: string;
  updatedAt: string;
  lastLogin: string;
  isActive: boolean;
  isSuperAdmin?: boolean;
  artisanProfile?: ArtisanProfileDetails;
  photo?: string;
}

export interface ArtisanProfile {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email: string;
  adresse: string;
  departement: string;
  dateInscription: string;
  photo: string;
  dateCreation: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  nom: string;
  description: string;
  categorie: string;
  prix: number;
  stock: number;
  artisanId: string;
  artisan?: ArtisanProfile;
  image: string;
  dateCreation: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;  // Changed from Date to string for mock data compatibility
  updatedAt: string;  // Added to match the previous implementation
}

export interface SaleItem {
  productId: string;
  product?: Product;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  artisanId: string;
  artisan?: ArtisanProfile;
  clientNom: string;
  montantTotal: number;
  dateDVente: string;
  numeroFacture: string;
  statut?: 'en_attente' | 'validee' | 'annulee';
  modePaiement?: 'especes' | 'cheque' | 'virement' | 'carte';
  notes?: string;
}

export interface DashboardStats {
  caTotal: number;
  ventesTotales: number;
  nombreArtisans: number;
  nombreProduits: number;
  ventesParMois: { mois: string; montant: number }[];
  ventesParCategorie: { categorie: string; montant: number }[];
  ventesParArtisan: { artisan: string; montant: number }[];
  topProduits: { nom: string; ventes: number }[];
}

export interface ArtisanDashboardStats {
  ventesTotales: number;
  caTotal: number;
  nombreProduits: number;
  ventesParMois: { mois: string; montant: number }[];
  topProduits: { nom: string; ventes: number }[];
  stockRestant: { produit: string; stock: number }[];
}

export interface AuthContextType {
  // État
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isArtisan: boolean;
  
  // Méthodes d'authentification
  login: (email: string, password: string, role: 'admin' | 'artisan') => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Méthodes de profil utilisateur
  updateProfile: (userId: string, updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  password: string;
  user_type?: 'admin' | 'artisan' | 'secondary_admin';
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  departement?: string;
  photo?: File | null;
}

export type UserRole = 'admin' | 'artisan';