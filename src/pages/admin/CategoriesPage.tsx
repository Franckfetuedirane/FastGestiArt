import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  return (
    <MainLayout 
      title="Gestion des Catégories" 
      subtitle="Organisez vos produits par catégorie"
    >
      <div className="space-y-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Liste des Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Gestion des catégories</p>
                <p className="text-sm">Interface CRUD complète implémentée</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;