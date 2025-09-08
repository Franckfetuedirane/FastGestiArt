import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';

const SalesPage: React.FC = () => {
  return (
    <MainLayout 
      title="Gestion des Ventes" 
      subtitle="Suivez toutes les transactions"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Ventes</h2>
          </div>
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle vente
          </Button>
        </div>

        {/* Sales Table Placeholder */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Historique des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Gestion des ventes</p>
                <p className="text-sm">Interface CRUD complète avec génération de factures à implémenter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesPage;