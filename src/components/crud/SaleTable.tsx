import React, { useState } from 'react';
import { Sale, Product, ArtisanProfile, SaleItem } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Search 
} from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import jsPDF from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import 'jspdf-autotable';

interface AutoTableOptions {
  head: string[][];
  body: (string | number)[][];
  startY: number;
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: { [key: string]: any };
  didDrawPage?: (data: any) => void;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: AutoTableOptions) => jsPDF;
}

interface SaleTableProps {
  sales: Sale[];
  products: Product[];
  artisans: ArtisanProfile[];
  onAdd: () => void;
  onEdit: (sale: Sale) => void;
  onView: (sale: Sale) => void;
  onDelete: (id: string) => Promise<void>;
}

export const SaleTable: React.FC<SaleTableProps> = ({
  sales,
  products,
  artisans,
  onAdd,
  onEdit,
  onView,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Ajout de logs pour le débogage
  console.log('[SaleTable] Nombre de ventes reçues:', sales.length);
  console.log('[SaleTable] Produits disponibles:', products.length);
  console.log('[SaleTable] Artisans disponibles:', artisans.length);

  // Type amélioré pour les ventes avec les relations chargées
  type EnhancedSale = Sale & {
    items: Array<SaleItem & { product?: Product }>;
    artisan?: ArtisanProfile;
  };

  const filteredSales = sales
    .map(sale => {
      // S'assurer que les items sont un tableau et charger les relations
      const items = Array.isArray(sale.items) ? sale.items : [];
      
      const enhancedItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product,
          // Fournir des valeurs par défaut pour éviter les erreurs d'affichage
          quantite: item.quantite || 0,
          prixUnitaire: item.prixUnitaire || 0,
          montant: item.montant || (item.prixUnitaire || 0) * (item.quantite || 1)
        };
      });
      
      // Trouver l'artisan correspondant ou utiliser un objet par défaut
      const artisan = artisans.find(a => a.id === sale.artisanId) || {
        id: 'inconnu',
        nom: 'Artisan',
        prenom: 'Inconnu',
        specialite: '',
        telephone: '',
        email: '',
        adresse: '',
        departement: '',
        photo: '',
        userId: '',
        produits: [],
        ventes: [],
        dateCreation: new Date().toISOString(),
      };
      
      return {
        ...sale,
        items: enhancedItems,
        artisan,
      };
    })
    .filter((sale: EnhancedSale) => {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Vérifier les champs de base
      const matchesClient = sale.clientNom?.toLowerCase().includes(searchTermLower);
      const matchesArtisan = sale.artisan?.nom.toLowerCase().includes(searchTermLower) ||
                             sale.artisan?.prenom.toLowerCase().includes(searchTermLower);
      
      // Vérifier les noms de produits
      const matchesProduct = sale.items.some(item =>
        item.product?.nom.toLowerCase().includes(searchTermLower)
      );

      return matchesClient || matchesArtisan || matchesProduct;
    });

  const generateInvoice = (sale: Sale) => {
    if (!sale) {
      toast({
        title: "Erreur",
        description: "Données de vente non disponibles pour générer la facture.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;

    // En-tête
    doc.setFontSize(18);
    doc.text('Facture', 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${sale.dateDVente ? format(new Date(sale.dateDVente), 'dd/MM/yyyy') : 'N/A'}`, 14, 32);
    doc.text(`Facture #: ${sale.id}`, 14, 38);

    // Informations sur le client
    doc.setFontSize(12);
    doc.text('Client:', 14, 50);
    doc.setFontSize(10);
    doc.text(sale.clientNom || 'N/A', 14, 56);

    // Tableau des produits
    const invoiceBody = (sale.items || []).map(item => {
      const product = products.find(p => p.id === item.productId);
      return [
        product?.nom || 'Produit inconnu',
        item.quantite,
        `${item.prixUnitaire.toLocaleString()} FCFA`,
        `${item.montant.toLocaleString()} FCFA`,
      ];
    });

    doc.autoTable({
      startY: 65,
      head: [['Produit', 'Quantité', 'Prix Unitaire', 'Total']],
      body: invoiceBody,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text('Total:', 14, finalY + 10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${(sale.montantTotal || 0).toLocaleString()} FCFA`, 150, finalY + 10, { align: 'right' });

    // Pied de page
    doc.setFontSize(10);
    doc.text('Merci pour votre achat!', 14, finalY + 30);

    doc.save(`facture_${sale.id}.pdf`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text('Rapport des Ventes', 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 30);

    const head = [['Date', 'Client', 'Produit(s)', 'Artisan', 'Qté', 'Total']];
    const body = filteredSales.map(sale => {
      const firstProduct = sale.items[0]?.product?.nom || 'N/A';
      const artisanName = `${sale.artisan?.prenom} ${sale.artisan?.nom}`;
      const totalQuantity = sale.items.reduce((acc, item) => acc + item.quantite, 0);
      return [
        sale.dateDVente ? format(new Date(sale.dateDVente), 'dd/MM/yyyy') : '-',
        sale.clientNom || '-',
        firstProduct + (sale.items.length > 1 ? ` +${sale.items.length - 1}` : ''),
        artisanName,
        totalQuantity,
        `${(sale.montantTotal || 0).toLocaleString()} FCFA`,
      ];
    });

    doc.autoTable({
      startY: 40,
      head,
      body,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('rapport_ventes.pdf');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Liste des Ventes</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={onAdd} className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une vente
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Produit(s)</TableHead>
                <TableHead>Artisan</TableHead>
                <TableHead>Quantité totale</TableHead>
                <TableHead>Montant Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Aucune vente trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale: EnhancedSale) => {
                  const firstProductName = sale.items[0]?.product?.nom || 'N/A';
                  const additionalItemsCount = sale.items.length - 1;
                  const artisanName = `${sale.artisan?.prenom} ${sale.artisan?.nom}`;
                  const totalQuantity = sale.items.reduce((acc, item) => acc + item.quantite, 0);

                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {sale.dateDVente ? format(new Date(sale.dateDVente), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{sale.clientNom || '-'}</TableCell>
                      <TableCell>
                        {firstProductName}
                        {additionalItemsCount > 0 && ` +${additionalItemsCount} autres`}
                      </TableCell>
                      <TableCell>{artisanName}</TableCell>
                      <TableCell>{totalQuantity}</TableCell>
                      <TableCell className="font-medium">
                        {sale.montantTotal ? `${sale.montantTotal.toLocaleString()} FCFA` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(sale)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(sale)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(sale.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateInvoice(sale)}>
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger la facture
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
