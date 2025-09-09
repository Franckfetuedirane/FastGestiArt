import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { mockSales, mockArtisans } from '@/data/mockData';

interface WeeklyReport {
  sales: Array<{
    id: string;
    designation: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    boutiqueNumber: string;
    artisanName: string;
    comments?: string;
  }>;
  totalAmount: number;
  visitors: {
    men: number;
    women: number;
    foreigners: number;
    total: number;
  };
}

const ReportsPage: React.FC = () => {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>({
    sales: [],
    totalAmount: 0,
    visitors: {
      men: 0,
      women: 0,
      foreigners: 0,
      total: 0
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    generateWeeklyReport(new Date(date));
  }, [date]);

  const generateWeeklyReport = (selectedDate: Date) => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);

    // Filtrer les ventes de la semaine
    const weekSales = mockSales.filter(sale => {
      const saleDate = new Date(sale.dateDVente);
      return saleDate >= start && saleDate <= end;
    });

    // Formatter les données pour le rapport
    const formattedSales = weekSales.map(sale => ({
      id: sale.id,
      designation: sale.product?.nom || '',
      quantity: sale.quantite,
      unitPrice: sale.product?.prix || 0,
      totalPrice: sale.montantTotal,
      boutiqueNumber: sale.artisan?.id || '',
      artisanName: `${sale.artisan?.prenom} ${sale.artisan?.nom}` || '',
      comments: ''
    }));

    // Calculer les totaux
    const totalAmount = formattedSales.reduce((acc, sale) => acc + sale.totalPrice, 0);

    // Simuler les données de visiteurs (à remplacer par de vraies données)
    const visitors = {
      men: Math.floor(Math.random() * 50) + 20,
      women: Math.floor(Math.random() * 50) + 30,
      foreigners: Math.floor(Math.random() * 20) + 5,
      total: 0
    };
    visitors.total = visitors.men + visitors.women + visitors.foreigners;

    setWeeklyReport({
      sales: formattedSales,
      totalAmount,
      visitors
    });
  };

  const generatePDF = async () => {
    try {
      const reportElement = document.getElementById('report-template');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-hebdomadaire-${format(new Date(date), 'dd-MM-yyyy')}.pdf`);

      toast({
        title: "Succès",
        description: "Le rapport a été généré avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout 
      title="Rapports Hebdomadaires" 
      subtitle="Générer et visualiser les rapports de ventes"
    >
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-auto"
              />
              <Button onClick={generatePDF}>
                Générer le rapport PDF
              </Button>
            </div>

            <div id="report-template" className="bg-white p-8 border rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">RAPPORT HEBDOMADAIRE VENTE</h2>
                <p>Semaine du: {format(startOfWeek(new Date(date)), 'dd MMMM yyyy', { locale: fr })} au {format(endOfWeek(new Date(date)), 'dd MMMM yyyy', { locale: fr })}</p>
              </div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>DESIGNATIONS</th>
                    <th>QUANTITES</th>
                    <th>P.U</th>
                    <th>P.T</th>
                    <th>N° DE BOUTIQUE</th>
                    <th>NOMS DE L'ARTISAN</th>
                    <th>COMMENTAIRES</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyReport.sales.map((sale, index) => (
                    <tr key={sale.id}>
                      <td>{index + 1}</td>
                      <td>{sale.designation}</td>
                      <td>{sale.quantity}</td>
                      <td>{sale.unitPrice.toLocaleString()} FCFA</td>
                      <td>{sale.totalPrice.toLocaleString()} FCFA</td>
                      <td>{sale.boutiqueNumber}</td>
                      <td>{sale.artisanName}</td>
                      <td>{sale.comments}</td>
                    </tr>
                  ))}
                  {/* Lignes vides pour compléter le tableau */}
                  {Array.from({ length: Math.max(0, 15 - weeklyReport.sales.length) }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td>{weeklyReport.sales.length + index + 1}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="font-bold">TOTAL GENERAL</td>
                    <td className="font-bold">{weeklyReport.totalAmount.toLocaleString()} FCFA</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-6">
                <h3 className="font-bold mb-2">NOMBRE DE VISITEURS</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Hommes</th>
                      <th>Femmes</th>
                      <th>Visiteurs Etrangers</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{weeklyReport.visitors.men}</td>
                      <td>{weeklyReport.visitors.women}</td>
                      <td>{weeklyReport.visitors.foreigners}</td>
                      <td>{weeklyReport.visitors.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-2">REMARQUES ET SUGGESTIONS</h3>
                <div className="border p-4 min-h-[100px]"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default ReportsPage;