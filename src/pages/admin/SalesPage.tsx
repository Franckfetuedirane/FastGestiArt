import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SaleTable } from '@/components/crud/SaleTable';
import { Sale } from '@/types';
import { salesAPI } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await salesAPI.getAll();
      setSales(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des ventes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La création de vente sera bientôt disponible.",
    });
  };

  const handleEdit = (sale: Sale) => {
    toast({
      title: "Fonctionnalité à venir",
      description: `Modification de la vente "${sale.numeroFacture}" sera bientôt disponible.`,
    });
  };

  const handleView = (sale: Sale) => {
    toast({
      title: "Détails",
      description: `Visualisation des détails de la vente "${sale.numeroFacture}".`,
    });
  };

  const handleViewInvoice = (sale: Sale) => {
    toast({
      title: "Facture",
      description: `Affichage de la facture "${sale.numeroFacture}".`,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await salesAPI.delete(id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vente.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestion des Ventes" subtitle="Suivez toutes les transactions">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Gestion des Ventes" 
      subtitle="Suivez toutes les transactions"
    >
      <SaleTable
        sales={sales}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onViewInvoice={handleViewInvoice}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
};

export default SalesPage;