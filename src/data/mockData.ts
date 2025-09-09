// Mock data pour GestiArt
import { ArtisanProfile, Product, Category, Sale, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@gestiart.com',
    role: 'admin'
  },
  {
    id: 'admin-2',
    email: 'admin.assistant@gestiart.com',
    role: 'admin'
  },
  {
    id: 'artisan-1',
    email: 'marie.dubois@gmail.com',
    role: 'artisan',
    profile: {
      id: 'artisan-1',
      nom: 'Dubois',
      prenom: 'Marie',
      specialite: 'Poterie',
      telephone: '221-77-123-4567',
      email: 'marie.dubois@gmail.com',
      adresse: '123 Rue de la Céramique, Dakar',
      departement: 'MIFI',
      dateInscription: '2023-01-15',
      photo: '/api/placeholder/150/150'
    }
  },
  {
    id: 'artisan-2',
    email: 'ibrahim.diallo@gmail.com',
    role: 'artisan',
    profile: {
      id: 'artisan-2',
      nom: 'Diallo',
      prenom: 'Ibrahim',
      specialite: 'Sculpture sur bois',
      telephone: '221-76-987-6543',
      email: 'ibrahim.diallo@gmail.com',
      adresse: '456 Avenue des Artisans, MIFI',
      departement: 'MIFI',
      dateInscription: '2023-03-20',
      photo: '/api/placeholder/150/150'
    }
  },
  {
    id: 'artisan-3',
    email: 'fatou.sene@gmail.com',
    role: 'artisan',
    profile: {
      id: 'artisan-3',
      nom: 'Sène',
      prenom: 'Fatou',
      specialite: 'Bijouterie',
      telephone: '221-78-555-1234',
      email: 'fatou.sene@gmail.com',
      adresse: '789 Boulevard de l\'Artisanat, MIFI',
      departement: 'MIFI',
      dateInscription: '2023-02-10',
      photo: '/api/placeholder/150/150'
    }
  },
  {
    id: 'artisan-4',
    email: 'moussa.niang@gmail.com',
    role: 'artisan',
    profile: {
      id: 'artisan-4',
      nom: 'Niang',
      prenom: 'Moussa',
      specialite: 'Textile',
      telephone: '221-70-444-5678',
      email: 'moussa.niang@gmail.com',
      adresse: '321 Rue du Textile, MIFI',
      departement: 'MIFI',
      dateInscription: '2023-04-05',
      photo: '/api/placeholder/150/150'
    }
  }
];

export const mockArtisans: ArtisanProfile[] = mockUsers
  .filter(user => user.role === 'artisan' && user.profile)
  .map(user => user.profile!);

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

export const mockSales: Sale[] = [
  {
    id: 'sale-1',
    productId: 'prod-1',
    artisanId: 'artisan-1',
    clientNom: 'Amadou Ba',
    quantite: 2,
    montantTotal: 30000,
    dateDVente: '2024-01-20',
    numeroFacture: 'FACT-2024-001'
  },
  {
    id: 'sale-2',
    productId: 'prod-3',
    artisanId: 'artisan-2',
    clientNom: 'Aïssa Ndiaye',
    quantite: 1,
    montantTotal: 45000,
    dateDVente: '2024-01-22',
    numeroFacture: 'FACT-2024-002'
  },
  {
    id: 'sale-3',
    productId: 'prod-5',
    artisanId: 'artisan-3',
    clientNom: 'Oumar Sow',
    quantite: 3,
    montantTotal: 36000,
    dateDVente: '2024-01-25',
    numeroFacture: 'FACT-2024-003'
  },
  {
    id: 'sale-4',
    productId: 'prod-2',
    artisanId: 'artisan-1',
    clientNom: 'Marième Fall',
    quantite: 1,
    montantTotal: 8000,
    dateDVente: '2024-02-01',
    numeroFacture: 'FACT-2024-004'
  },
  {
    id: 'sale-5',
    productId: 'prod-4',
    artisanId: 'artisan-2',
    clientNom: 'Cheikh Mbaye',
    quantite: 2,
    montantTotal: 50000,
    dateDVente: '2024-02-05',
    numeroFacture: 'FACT-2024-005'
  },
  {
    id: 'sale-6',
    productId: 'prod-6',
    artisanId: 'artisan-3',
    clientNom: 'Ndeye Fatou Diop',
    quantite: 1,
    montantTotal: 18000,
    dateDVente: '2024-02-08',
    numeroFacture: 'FACT-2024-006'
  }
];

// Ajouter les références produit et artisan aux ventes
mockSales.forEach(sale => {
  sale.product = mockProducts.find(p => p.id === sale.productId);
  sale.artisan = mockArtisans.find(a => a.id === sale.artisanId);
});

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