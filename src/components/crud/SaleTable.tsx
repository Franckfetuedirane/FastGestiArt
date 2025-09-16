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
      // Charger les relations
      const enhancedItems = sale.items.map(item => ({
        ...item,
        product: products.find(p => p.id === item.productId)
      }));
      
      const artisan = artisans.find(a => a.id === sale.artisanId);
      
      return {
        ...sale,
        items: enhancedItems,
        artisan
      } as EnhancedSale;
    })
    .filter(sale => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const productNames = sale.items
        .map(item => item.product?.nom || '')
        .join(' ')
        .toLowerCase();
      
      return (
        sale.numeroFacture?.toLowerCase().includes(searchLower) ||
        sale.clientNom?.toLowerCase().includes(searchLower) ||
        productNames.includes(searchLower) ||
        sale.artisan?.nom?.toLowerCase().includes(searchLower) ||
        sale.artisan?.prenom?.toLowerCase().includes(searchLower)
      );
    });
    
  console.log(`[SaleTable] ${filteredSales.length} ventes après filtrage`);

  const generateInvoice = async (sale: Sale) => {
    try {
      const pdf = new jsPDF();
      
      // En-tête
      pdf.setFontSize(20);
      pdf.text("FACTURE", 105, 20, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(`N° : ${sale.numeroFacture || 'N/A'}`, 20, 40);
      pdf.text(`Date : ${sale.dateDVente ? format(new Date(sale.dateDVente), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}`, 20, 50);
      
      // Informations client
      pdf.text("Client :", 20, 70);
      pdf.text(sale.clientNom || 'Non spécifié', 60, 70);
      
      // Informations artisan
      pdf.text("Artisan :", 20, 80);
      pdf.text(sale.artisan ? `${sale.artisan.prenom || ''} ${sale.artisan.nom || ''}`.trim() : 'Non spécifié', 60, 80);
      
      // Tableau des produits
      const headers = ["Produit", "Quantité", "Prix unitaire", "Total"];
      
      // Préparer les données du tableau
      const data = sale.items?.map(item => ({
        nom: item.product?.nom || 'Produit inconnu',
        quantite: item.quantite || 0,
        prixUnitaire: item.prixUnitaire || 0,
        montant: item.montant || 0
      })) || [];
      
      let startY = 100;
      
      // En-tête du tableau
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, startY - 10, 170, 10, "F");
      
      // Largeurs des colonnes
      const colWidths = [70, 25, 35, 40];
      let xPos = 20;
      
      // Dessiner les en-têtes
      headers.forEach((header, i) => {
        pdf.text(header, xPos + 5, startY - 2);
        xPos += colWidths[i];
      });
      
      // Contenu du tableau
      data.forEach((item, i) => {
        const yPos = startY + 10 + (i * 10);
        xPos = 20;
        
        // Nom du produit
        pdf.text(item.nom, xPos + 5, yPos);
        xPos += colWidths[0];
        
        // Quantité
        pdf.text(item.quantite.toString(), xPos + 5, yPos);
        xPos += colWidths[1];
        
        // Prix unitaire
        pdf.text(`${item.prixUnitaire.toLocaleString()} FCFA`, xPos + 5, yPos);
        xPos += colWidths[2];
        
        // Montant total
        pdf.text(`${item.montant.toLocaleString()} FCFA`, xPos + 5, yPos);
      });
      
      // Ligne de séparation
      const lastY = startY + 20 + (data.length * 10);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, lastY, 190, lastY);
      
      // Total
      pdf.setFontSize(14);
      pdf.text(
        `Total : ${sale.montantTotal ? sale.montantTotal.toLocaleString() : '0'} FCFA`,
        150,
        lastY + 15,
        { align: "right" }
      );

      // Pied de page
      pdf.setFontSize(10);
      pdf.text("Merci de votre confiance!", 105, 270, { align: "center" });
      
      // Enregistrer le PDF
      const fileName = `facture-${sale.numeroFacture || 'sans-numero'}-${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Succès",
        description: "La facture a été générée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Liste des Ventes</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle vente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une vente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Artisan</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {sales.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                        <p>Aucune vente enregistrée</p>
                      </div>
                    ) : (
                      <p>Aucune vente ne correspond à votre recherche</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => {
                  const totalQuantity = sale.items?.reduce((sum, item) => sum + (item.quantite || 0), 0) || 0;
                  const firstProductName = sale.items?.[0]?.product?.nom || 'Produit inconnu';
                  const additionalItemsCount = sale.items?.length > 1 ? sale.items.length - 1 : 0;
                  const artisanName = sale.artisan 
                    ? `${sale.artisan.prenom || ''} ${sale.artisan.nom || ''}`.trim() 
                    : 'Artisan inconnu';
                  
                  return (
                    <TableRow key={sale.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{sale.numeroFacture || '-'}</TableCell>
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