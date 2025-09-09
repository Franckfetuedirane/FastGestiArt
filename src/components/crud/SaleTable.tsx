import React, { useState } from 'react';
import { Sale, Product, ArtisanProfile } from '@/types';
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

  const filteredSales = sales.filter(sale =>
    sale.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.artisan?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateInvoice = async (sale: Sale) => {
    try {
      const pdf = new jsPDF();
      
      // En-tête
      pdf.setFontSize(20);
      pdf.text("FACTURE", 105, 20, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(`N° : ${sale.numeroFacture}`, 20, 40);
      pdf.text(`Date : ${format(new Date(sale.dateDVente), 'dd MMMM yyyy', { locale: fr })}`, 20, 50);
      
      // Informations client
      pdf.text("Client :", 20, 70);
      pdf.text(sale.clientNom, 60, 70);
      
      // Informations artisan
      pdf.text("Artisan :", 20, 80);
      pdf.text(`${sale.artisan?.prenom} ${sale.artisan?.nom}`, 60, 80);
      
      // Tableau des produits
      const headers = ["Produit", "Quantité", "Prix unitaire", "Total"];
      const data = [
        [
          sale.product?.nom || "",
          sale.quantite.toString(),
          `${sale.product?.prix.toLocaleString()} FCFA`,
          `${sale.montantTotal.toLocaleString()} FCFA`
        ]
      ];
      
      let startY = 100;
      
      // En-tête du tableau
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, startY - 10, 170, 10, "F");
      headers.forEach((header, i) => {
        pdf.text(header, 30 + (i * 45), startY - 2);
      });
      
      // Contenu du tableau
      data.forEach((row, i) => {
        row.forEach((cell, j) => {
          pdf.text(cell, 30 + (j * 45), startY + 10 + (i * 10));
        });
      });
      
      // Total
      pdf.setFontSize(14);
      pdf.text(
        `Total : ${sale.montantTotal.toLocaleString()} FCFA`,
        150,
        startY + 40,
        { align: "right" }
      );

      // Pied de page
      pdf.setFontSize(10);
      pdf.text("Merci de votre confiance!", 105, 270, { align: "center" });
      
      pdf.save(`facture-${sale.numeroFacture}.pdf`);
      
      toast({
        title: "Succès",
        description: "La facture a été générée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture",
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
            {filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.numeroFacture}</TableCell>
                <TableCell>
                  {format(new Date(sale.dateDVente), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>{sale.clientNom}</TableCell>
                <TableCell>{sale.product?.nom}</TableCell>
                <TableCell>
                  {sale.artisan ? `${sale.artisan.prenom} ${sale.artisan.nom}` : '-'}
                </TableCell>
                <TableCell>{sale.quantite}</TableCell>
                <TableCell>{sale.montantTotal.toLocaleString()} FCFA</TableCell>
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
                      <DropdownMenuItem onClick={() => generateInvoice(sale)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Voir la facture
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateInvoice(sale)}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(sale.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};