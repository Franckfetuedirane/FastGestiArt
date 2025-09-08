import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileBarChart, Calendar } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <MainLayout 
      title="Rapports et Analyses" 
      subtitle="Générez des rapports détaillés"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Rapports</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Rapport hebdomadaire
            </Button>
            <Button className="btn-primary">
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* Reports Dashboard Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Rapport des Ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <FileBarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Génération de rapports PDF à implémenter</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Rapport des Artisans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="text-center">
                  <FileBarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Analyses par artisan à implémenter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;