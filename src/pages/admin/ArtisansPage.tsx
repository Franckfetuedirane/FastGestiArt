import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

const ArtisansPage: React.FC = () => {
  return (
    <MainLayout 
      title="Gestion des Artisans" 
      subtitle="Gérez la communauté d'artisans"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Artisans</h2>
          </div>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un artisan
          </Button>
        </div>

        {/* Artisans Grid Placeholder */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Liste des Artisans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Gestion des artisans</p>
                <p className="text-sm">Interface CRUD complète à implémenter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ArtisansPage;