import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DashboardStats, Sale, ArtisanProfile, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportGeneratorProps {
  type: 'sales' | 'artisans' | 'products' | 'general';
  data?: DashboardStats | Sale[] | ArtisanProfile[] | Product[];
  title: string;
  dateRange?: { start: string; end: string };
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  type,
  data,
  title,
  dateRange,
}) => {
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('GestiArt - Rapport', 20, 30);
      
      doc.setFontSize(16);
      doc.text(title, 20, 45);
      
      if (dateRange) {
        doc.setFontSize(12);
        doc.text(`Période: ${new Date(dateRange.start).toLocaleDateString('fr-FR')} - ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`, 20, 55);
      }
      
      doc.setFontSize(10);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 65);
      
      let yPosition = 80;
      
      switch (type) {
        case 'general':
          if (data && 'caTotal' in data) {
            const dashboardData = data as DashboardStats;
            
            doc.setFontSize(14);
            doc.text('Statistiques Générales', 20, yPosition);
            yPosition += 15;
            
            doc.setFontSize(12);
            doc.text(`Chiffre d'affaires total: ${dashboardData.caTotal.toLocaleString()} FCFA`, 20, yPosition);
            yPosition += 10;
            doc.text(`Nombre de ventes: ${dashboardData.ventesTotales}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Nombre d'artisans: ${dashboardData.nombreArtisans}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Nombre de produits: ${dashboardData.nombreProduits}`, 20, yPosition);
            yPosition += 20;
            
            // Top products
            doc.setFontSize(12);
            doc.text('Produits les plus vendus:', 20, yPosition);
            yPosition += 10;
            
            dashboardData.topProduits.slice(0, 5).forEach((product, index) => {
              doc.setFontSize(10);
              doc.text(`${index + 1}. ${product.nom} - ${product.ventes} ventes`, 20, yPosition);
              yPosition += 7;
            });
          }
          break;
          
        case 'sales':
          if (Array.isArray(data)) {
            const salesData = data as Sale[];
            (doc as any).autoTable({
              startY: yPosition,
              head: [['ID', 'Date', 'Client', 'Montant Total']],
              body: salesData.map(sale => [
                sale.id,
                new Date(sale.dateDVente).toLocaleDateString('fr-FR'),
                sale.clientNom,
                `${sale.montantTotal.toLocaleString()} FCFA`
              ]),
            });
          }
          break;
          
        case 'artisans':
          if (Array.isArray(data)) {
            const artisansData = data as ArtisanProfile[];
            (doc as any).autoTable({
              startY: yPosition,
              head: [['Nom', 'Spécialité', 'Téléphone', 'Email']],
              body: artisansData.map(artisan => [
                `${artisan.prenom} ${artisan.nom}`,
                artisan.specialite,
                artisan.telephone,
                artisan.email
              ]),
            });
          }
          break;
          
        case 'products':
          if (Array.isArray(data)) {
            const productsData = data as Product[];
            (doc as any).autoTable({
              startY: yPosition,
              head: [['Nom', 'Catégorie', 'Prix', 'Stock']],
              body: productsData.map(product => [
                product.nom,
                product.categorie,
                `${product.prix.toLocaleString()} FCFA`,
                product.stock
              ]),
            });
          }
          break;
      }
      
      const fileName = `Rapport_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Rapport généré",
        description: `Le rapport a été téléchargé sous le nom ${fileName}.`,
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={generatePDF}>
      <Download className="h-4 w-4 mr-2" />
      Télécharger le Rapport
    </Button>
  );
};

export const InvoiceGenerator: React.FC<{ sale: Sale & { artisan?: ArtisanProfile, product?: Product } }> = ({ sale }) => {
  const { toast } = useToast();

  const generateInvoice = () => {
    try {
      if (!sale) {
        toast({
          title: "Erreur",
          description: "Données de la vente non disponibles.",
          variant: "destructive"
        });
        return;
      }

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Facture', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Numéro: ${sale.numeroFacture || sale.id}`, 20, 40);
      doc.text(`Date: ${new Date(sale.dateDVente).toLocaleDateString('fr-FR')}`, 20, 50);
      
      // Company info (right side)
      doc.text('GestiArt', 140, 30);
      doc.setFontSize(10);
      doc.text('Système de gestion artisanale', 140, 40);
      doc.text('Dakar, Sénégal', 140, 50);
      doc.text('contact@gestiart.sn', 140, 60);
      
      // Client info
      doc.setFontSize(12);
      doc.text('Facturé à:', 20, 80);
      doc.text(sale.clientNom, 20, 90);
      
      // Artisan info
      if (sale.artisan) {
        doc.text('Artisan:', 140, 80);
        doc.text(`${sale.artisan.prenom} ${sale.artisan.nom}`, 140, 90);
        doc.text(sale.artisan.specialite, 140, 100);
      }
      
      // Table header
      let yPosition = 120;
      doc.setFontSize(10);
      doc.text('Description', 20, yPosition);
      doc.text('Qté', 100, yPosition);
      doc.text('Prix unitaire', 130, yPosition);
      doc.text('Total', 170, yPosition);
      
      // Line under headers
      doc.line(20, yPosition + 5, 190, yPosition + 5);
      yPosition += 15;
      
      // Product details
      if (sale.product) {
        doc.text(sale.product.nom, 20, yPosition);
        doc.text(sale.quantite.toString(), 100, yPosition);
        doc.text(`${sale.product.prix.toLocaleString()} FCFA`, 130, yPosition);
        doc.text(`${sale.montantTotal.toLocaleString()} FCFA`, 170, yPosition);
        yPosition += 10;
      }
      
      // Total line
      doc.line(20, yPosition + 5, 190, yPosition + 5);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.text('TOTAL À PAYER:', 130, yPosition);
      doc.text(`${sale.montantTotal.toLocaleString()} FCFA`, 170, yPosition);
      
      // Footer
      yPosition += 40;
      doc.setFontSize(10);
      doc.text('Merci pour votre confiance !', 20, yPosition);
      doc.text('Cette facture est générée automatiquement par GestiArt', 20, yPosition + 10);
      
      // Download
      const fileName = `Facture_${sale.numeroFacture}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Facture générée",
        description: `La facture ${sale.numeroFacture} a été téléchargée.`,
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={generateInvoice} variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Facture PDF
    </Button>
  );
};
