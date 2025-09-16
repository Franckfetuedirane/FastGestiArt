// Mock data pour GestiArt
import { ArtisanProfile, Product, Category, Sale, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@gestiart.com',
    user_type: 'admin',
    nom: 'Admin',
    prenom: 'Système',
    telephone: '0600000000',
    adresse: 'Siège social',
    dateCreation: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    isSuperAdmin: true
  },
  {
    id: 'admin-2',
    email: 'admin.assistant@gestiart.com',
    user_type: 'admin',
    nom: 'Assistant',
    prenom: 'Admin',
    telephone: '0600000001',
    adresse: 'Siège social',
    dateCreation: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'artisan-1',
    email: 'marie.dubois@gmail.com',
    user_type: 'artisan',
    nom: 'Dubois',
    prenom: 'Marie',
    telephone: '221-77-123-4567',
    adresse: '123 Rue de la Céramique, Dakar',
    dateCreation: '2023-01-15',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    artisanProfile: {
      id: 'artisan-profile-1',
      userId: 'artisan-1',
      specialite: 'Poterie',
      description: 'Artisan spécialisé en poterie traditionnelle',
      anneesExperience: 5,
      statut: 'actif'
    }
  },
  {
    id: 'artisan-2',
    email: 'ibrahim.diallo@gmail.com',
    user_type: 'artisan',
    nom: 'Diallo',
    prenom: 'Ibrahim',
    telephone: '221-76-987-6543',
    adresse: '456 Avenue des Artisans, MIFI',
    dateCreation: '2023-03-20',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    artisanProfile: {
      id: 'artisan-profile-2',
      userId: 'artisan-2',
      specialite: 'Sculpture sur bois',
      description: 'Artisan spécialisé en sculpture sur bois',
      anneesExperience: 8,
      statut: 'actif'
    }
  },
  {
    id: 'artisan-3',
    email: 'fatou.sene@gmail.com',
    user_type: 'artisan',
    nom: 'Sène',
    prenom: 'Fatou',
    telephone: '221-78-555-1234',
    adresse: '789 Boulevard de l\'Artisanat, MIFI',
    dateCreation: '2023-02-10',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    artisanProfile: {
      id: 'artisan-profile-3',
      userId: 'artisan-3',
      specialite: 'Bijouterie',
      description: 'Créatrice de bijoux artisanaux',
      anneesExperience: 4,
      statut: 'actif'
    }
  },
  {
    id: 'artisan-4',
    email: 'moussa.niang@gmail.com',
    user_type: 'artisan',
    nom: 'Niang',
    prenom: 'Moussa',
    telephone: '221-70-444-5678',
    adresse: '321 Rue du Textile, MIFI',
    dateCreation: '2023-04-05',
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    artisanProfile: {
      id: 'artisan-profile-4',
      userId: 'artisan-4',
      specialite: 'Textile',
      description: 'Artisan spécialisé en tissage traditionnel',
      anneesExperience: 6,
      statut: 'actif'
    }
  }
];

// Convertir les utilisateurs avec artisanProfile en profils d'artisans
export const mockArtisans: ArtisanProfile[] = mockUsers
  .filter(user => user.user_type === 'artisan' && user.artisanProfile)
  .map(user => ({
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    specialite: user.artisanProfile?.specialite || '',
    telephone: user.telephone,
    email: user.email,
    adresse: user.adresse,
    departement: 'MIFI', // Valeur par défaut
    dateInscription: user.dateCreation,
    photo: '/api/placeholder/150/150',
    dateCreation: user.dateCreation,
    updatedAt: user.updatedAt
  }));

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Poterie',
    description: 'Articles en céramique et terre cuite',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: 'cat-2',
    name: 'Sculpture',
    description: 'Sculptures en bois, pierre et métal',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: 'cat-3',
    name: 'Bijouterie',
    description: 'Bijoux traditionnels et contemporains',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: 'cat-4',
    name: 'Textile',
    description: 'Tissus, vêtements et accessoires textiles',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: 'cat-5',
    name: 'Maroquinerie',
    description: 'Articles en cuir fait main',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    nom: 'Vase en terre cuite',
    description: 'Magnifique vase artisanal en terre cuite, décoré à la main',
    categorie: 'Poterie',
    prix: 15000,
    stock: 12,
    artisanId: 'artisan-1',
    image: '/api/placeholder/300/300',
    dateCreation: '2024-01-15'
  },
  {
    id: 'prod-2',
    nom: 'Bol décoratif',
    description: 'Bol en céramique avec motifs traditionnels',
    categorie: 'Poterie',
    prix: 8000,
    stock: 20,
    artisanId: 'artisan-1',
    image: '/api/placeholder/300/300',
    dateCreation: '2024-01-20'
  },
  {
    id: 'prod-3',
    nom: 'Sculpture Lion',
    description: 'Sculpture de lion en bois d\'ébène, finition artisanale',
    categorie: 'Sculpture',
    prix: 45000,
    stock: 3,
    artisanId: 'artisan-2',
    image: '/api/placeholder/300/300',
    dateCreation: '2024-02-01'
  },
  {
    id: 'prod-4',
    nom: 'Masque traditionnel',
    description: 'Masque sculpté à la main selon les traditions locales',
    categorie: 'Sculpture',
    prix: 25000,
    stock: 8,
    artisanId: 'artisan-2',
    image: '/api/placeholder/300/300',
    dateCreation: '2024-02-10'
  },
  {
    id: 'prod-5',
    nom: 'Collier en perles',
    description: 'Collier traditionnel avec perles colorées fait main',
    categorie: 'Bijouterie',
    prix: 12000,
    stock: 15,
    artisanId: 'artisan-3',
    image: '/api/placeholder/300/300',
    dateCreation: '2024-01-25'
  },
  {
    id: 'prod-6',
    nom: 'Bracelet en argent',
    description: 'Bracelet en argent avec gravures traditionnelles',
    categorie: 'Bijouterie',
    prix: 18000,
    stock: 10,
    artisanId: 'artisan-3',
    image: '/api/placeholder/300/300',
    dateCreation: '2024-02-05'
  }
];

// Ajouter les références artisan aux produits
mockProducts.forEach(product => {
  product.artisan = mockArtisans.find(a => a.id === product.artisanId);
});

// Mise à jour des ventes pour utiliser le tableau items
export const mockSales: Sale[] = [
  {
    id: 'sale-1',
    items: [
      {
        productId: 'prod-1',
        quantite: 2,
        prixUnitaire: 15000,
        montant: 30000
      }
    ],
    artisanId: 'artisan-1',
    clientNom: 'Amadou Ba',
    montantTotal: 30000,
    dateDVente: '2024-01-20',
    numeroFacture: 'FACT-2024-001',
    statut: 'validee',
    modePaiement: 'especes'
  },
  {
    id: 'sale-2',
    items: [
      {
        productId: 'prod-3',
        quantite: 1,
        prixUnitaire: 45000,
        montant: 45000
      }
    ],
    artisanId: 'artisan-2',
    clientNom: 'Aïssa Ndiaye',
    montantTotal: 45000,
    dateDVente: '2024-01-22',
    numeroFacture: 'FACT-2024-002',
    statut: 'validee',
    modePaiement: 'virement'
  },
  {
    id: 'sale-3',
    items: [
      {
        productId: 'prod-5',
        quantite: 3,
        prixUnitaire: 12000,
        montant: 36000
      }
    ],
    artisanId: 'artisan-3',
    clientNom: 'Oumar Sow',
    montantTotal: 36000,
    dateDVente: '2024-01-25',
    numeroFacture: 'FACT-2024-003',
    statut: 'validee',
    modePaiement: 'carte'
  },
  {
    id: 'sale-4',
    items: [
      {
        productId: 'prod-2',
        quantite: 1,
        prixUnitaire: 8000,
        montant: 8000
      }
    ],
    artisanId: 'artisan-1',
    clientNom: 'Marième Fall',
    montantTotal: 8000,
    dateDVente: '2024-02-01',
    numeroFacture: 'FACT-2024-004',
    statut: 'validee',
    modePaiement: 'especes'
  },
  {
    id: 'sale-5',
    items: [
      {
        productId: 'prod-4',
        quantite: 2,
        prixUnitaire: 25000,
        montant: 50000
      }
    ],
    artisanId: 'artisan-2',
    clientNom: 'Seydou Kane',
    montantTotal: 50000,
    dateDVente: '2024-02-05',
    numeroFacture: 'FACT-2024-005',
    statut: 'validee',
    modePaiement: 'cheque'
  },
  {
    id: 'sale-6',
    items: [
      {
        productId: 'prod-6',
        quantite: 2,
        prixUnitaire: 18000,
        montant: 36000
      }
    ],
    artisanId: 'artisan-3',
    clientNom: 'Aminata Diop',
    montantTotal: 36000,
    dateDVente: '2024-02-10',
    numeroFacture: 'FACT-2024-006',
    statut: 'validee',
    modePaiement: 'virement'
  }
];

// Les références aux produits sont maintenant gérées via le tableau items
// et les artisans sont déjà référencés par artisanId

// Données pour les statistiques
export const mockDashboardStats = {
  caTotal: 187000,
  ventesTotales: 10,
  nombreArtisans: 3,
  nombreProduits: 6,
  ventesParMois: [
    { mois: 'Jan', montant: 111000 },
    { mois: 'Fév', montant: 76000 },
    { mois: 'Mar', montant: 0 },
    { mois: 'Avr', montant: 0 }
  ],
  ventesParCategorie: [
    { categorie: 'Poterie', montant: 38000 },
    { categorie: 'Sculpture', montant: 95000 },
    { categorie: 'Bijouterie', montant: 54000 }
  ],
  ventesParArtisan: [
    { artisan: 'Marie Dubois', montant: 38000 },
    { artisan: 'Ibrahim Diallo', montant: 95000 },
    { artisan: 'Fatou Sène', montant: 54000 }
  ],
  topProduits: [
    { nom: 'Masque traditionnel', ventes: 2 },
    { nom: 'Collier en perles', ventes: 3 },
    { nom: 'Vase en terre cuite', ventes: 2 },
    { nom: 'Sculpture Lion', ventes: 1 },
    { nom: 'Bracelet en argent', ventes: 1 }
  ]
};