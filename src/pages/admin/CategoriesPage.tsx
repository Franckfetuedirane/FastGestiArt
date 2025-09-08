import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  return (
    <MainLayout 
      title="Gestion des Catégories" 
      subtitle="Organisez vos produits par catégories"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Catégories</h2>
          </div>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une catégorie
          </Button>
        </div>

        {/* Categories Grid Placeholder */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Liste des Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Gestion des catégories</p>
                <p className="text-sm">Interface CRUD complète à implémenter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;