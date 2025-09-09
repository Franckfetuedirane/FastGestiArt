import React from 'react';
import jsPDF from 'jspdf';
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
              doc.text(`${index + 1}. ${product.nom} - ${product.ventes} ventes`, 30, yPosition);
              yPosition += 8;
            });
          }
          break;
          
        case 'sales':
          if (Array.isArray(data)) {
            const salesData = data as Sale[];
            
            doc.setFontSize(14);
            doc.text(`Rapport des Ventes (${salesData.length} ventes)`, 20, yPosition);
            yPosition += 15;
            
            const totalAmount = salesData.reduce((sum, sale) => sum + sale.montantTotal, 0);
            doc.setFontSize(12);
            doc.text(`Montant total: ${totalAmount.toLocaleString()} FCFA`, 20, yPosition);
            yPosition += 15;
            
            // Table headers
            doc.setFontSize(10);
            doc.text('N° Facture', 20, yPosition);
            doc.text('Client', 70, yPosition);
            doc.text('Montant', 120, yPosition);
            doc.text('Date', 160, yPosition);
            yPosition += 10;
            
            // Line under headers
            doc.line(20, yPosition - 2, 190, yPosition - 2);
            
            salesData.slice(0, 20).forEach((sale) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.text(sale.numeroFacture, 20, yPosition);
              doc.text(sale.clientNom.substring(0, 15), 70, yPosition);
              doc.text(`${sale.montantTotal.toLocaleString()} FCFA`, 120, yPosition);
              doc.text(new Date(sale.dateDVente).toLocaleDateString('fr-FR'), 160, yPosition);
              yPosition += 8;
            });
            
            if (salesData.length > 20) {
              yPosition += 10;
              doc.text(`... et ${salesData.length - 20} autres ventes`, 20, yPosition);
            }
          }
          break;
          
        case 'artisans':
          if (Array.isArray(data)) {
            const artisansData = data as ArtisanProfile[];
            
            doc.setFontSize(14);
            doc.text(`Rapport des Artisans (${artisansData.length} artisans)`, 20, yPosition);
            yPosition += 20;
            
            // Table headers
            doc.setFontSize(10);
            doc.text('Nom', 20, yPosition);
            doc.text('Spécialité', 80, yPosition);
            doc.text('Département', 140, yPosition);
            yPosition += 10;
            
            // Line under headers
            doc.line(20, yPosition - 2, 190, yPosition - 2);
            
            artisansData.forEach((artisan) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.text(`${artisan.prenom} ${artisan.nom}`, 20, yPosition);
              doc.text(artisan.specialite.substring(0, 20), 80, yPosition);
              doc.text(artisan.departement, 140, yPosition);
              yPosition += 8;
            });
          }
          break;
          
        case 'products':
          if (Array.isArray(data)) {
            const productsData = data as Product[];
            
            doc.setFontSize(14);
            doc.text(`Rapport des Produits (${productsData.length} produits)`, 20, yPosition);
            yPosition += 20;
            
            // Table headers
            doc.setFontSize(10);
            doc.text('Nom', 20, yPosition);
            doc.text('Catégorie', 80, yPosition);
            doc.text('Prix', 120, yPosition);
            doc.text('Stock', 160, yPosition);
            yPosition += 10;
            
            // Line under headers
            doc.line(20, yPosition - 2, 190, yPosition - 2);
            
            productsData.forEach((product) => {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              
              doc.text(product.nom.substring(0, 25), 20, yPosition);
              doc.text(product.categorie, 80, yPosition);
              doc.text(`${product.prix.toLocaleString()} FCFA`, 120, yPosition);
              doc.text(product.stock.toString(), 160, yPosition);
              yPosition += 8;
            });
          }
          break;
      }
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} / ${pageCount}`, 170, 285);
        doc.text('GestiArt - Système de gestion artisanale', 20, 285);
      }
      
      // Download
      const fileName = `GestiArt_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Rapport généré",
        description: `Le rapport "${title}" a été téléchargé avec succès.`,
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={generatePDF} className="btn-primary">
      <Download className="h-4 w-4 mr-2" />
      Générer PDF
    </Button>
  );
};

interface InvoiceGeneratorProps {
  sale: Sale;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ sale }) => {
  const { toast } = useToast();

  const generateInvoice = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('FACTURE', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`N° : ${sale.numeroFacture}`, 20, 45);
      doc.text(`Date : ${new Date(sale.dateDVente).toLocaleDateString('fr-FR')}`, 20, 55);
      
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