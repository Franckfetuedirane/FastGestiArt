// Types pour l'application GestiArt

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'artisan';
  profile?: ArtisanProfile;
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

export interface Sale {
  id: string;
  productId: string;
  product?: Product;
  artisanId: string;
  artisan?: ArtisanProfile;
  clientNom: string;
  quantite: number;
  montantTotal: number;
  dateDVente: string;
  numeroFacture: string;
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
  user: User | null;
  login: (email: string, password: string, role: 'admin' | 'artisan') => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  adresse: string;
  departement: string;
  photo: File | null;
}

export type UserRole = 'admin' | 'artisan';