import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart,
  BarChart3,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChartContainer } from '@/components/ui/chart';
import { ArtisanDashboardStats } from '@/types';
import { statsAPI } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';

export const ArtisanDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<ArtisanDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 ArtisanDashboard: useEffect - user:', user);
    console.log('🔍 ArtisanDashboard: isAuthenticated:', isAuthenticated);
    
    const loadStats = async () => {
      console.log('🔄 ArtisanDashboard: Début du chargement des statistiques...');
      setIsLoading(true);
      setError(null);
      
      try {
        if (!user) {
          throw new Error('Aucun utilisateur connecté');
        }
        
        console.log('📋 ArtisanDashboard: Structure de l\'utilisateur:', {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          hasArtisanProfile: !!user.artisanProfile,
          artisanProfile: user.artisanProfile
        });
        
        // Utiliser l'ID de l'utilisateur comme ID de profil
        const profileId = user.id;
        console.log('🆔 ArtisanDashboard: ID de profil à utiliser:', profileId);
        
        console.log('📡 ArtisanDashboard: Appel à statsAPI.getArtisanStats avec ID:', profileId);
        const data = await statsAPI.getArtisanStats(profileId);
        console.log('📊 ArtisanDashboard: Données reçues de statsAPI:', data);
        
        if (!data) {
          throw new Error('Aucune donnée reçue du serveur');
        }
        
        setStats(data);
        console.log('✅ ArtisanDashboard: Statistiques mises à jour dans le state');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
        console.error('❌ ArtisanDashboard: Erreur:', errorMessage, err);
        setError(errorMessage);
      } finally {
        console.log('🏁 ArtisanDashboard: Fin du chargement des statistiques');
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadStats();
    } else {
      setIsLoading(false);
      setError('Veuillez vous connecter pour accéder à cette page');
    }
  }, [user, isAuthenticated]);

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Gestion des erreurs
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Erreur</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  // Vérification de l'utilisateur et des statistiques
  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-700 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Accès non autorisé</h2>
        <p>Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  const chartConfig = {
    montant: {
      label: "Montant (FCFA)",
      color: "hsl(var(--primary))",
    },
    stock: {
      label: "Stock",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Section */}
      <Card className="card-elegant">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-avatar.png" alt={`${user.prenom} ${user.nom}`} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                  {user.prenom?.[0] || ''}{user.nom?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {user.prenom} {user.nom}
                </h2>
                {user.artisanProfile?.specialite && (
                  <Badge variant="secondary" className="mt-1">
                    {user.artisanProfile.specialite}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:ml-auto">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{user.telephone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user.adresse}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Mes Ventes Totales"
          value={stats.ventesTotales}
          icon={ShoppingCart}
          trend={{ value: 5.2, label: "ce mois" }}
          iconClassName="bg-gradient-primary"
        />
        
        <StatsCard
          title="Mon Chiffre d'Affaires"
          value={`${stats.caTotal.toLocaleString()} FCFA`}
          icon={TrendingUp}
          trend={{ value: 12.1, label: "ce mois" }}
          iconClassName="bg-gradient-secondary"
        />
        
        <StatsCard
          title="Mes Produits"
          value={stats.nombreProduits}
          icon={Package}
          iconClassName="bg-gradient-accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des Ventes */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Mes Ventes Mensuelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.ventesParMois}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="mois" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
                  />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stock Restant */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-secondary" />
              Stock de mes Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.stockRestant}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="produit" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}`, 'Stock disponible']}
                  />
                  <Bar 
                    dataKey="stock" 
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Produits */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Mes Produits les Plus Vendus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topProduits.map((product, index) => (
              <div key={product.nom} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-accent-foreground font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.ventes} vente{product.ventes > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};