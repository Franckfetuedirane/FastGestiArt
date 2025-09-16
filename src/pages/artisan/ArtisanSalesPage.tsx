import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, Calendar, Eye, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sale } from '@/types';
import { saleAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ArtisanSalesPage: React.FC = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        try {
            setIsLoading(true);
            const data = await saleAPI.getAll(user?.email, user?.password);
            // Filtrer les ventes de cet artisan
            const artisanSales = data.filter(sale => sale.artisanId === user?.id);
            setSales(artisanSales);
        } catch (error) {
            console.error('Erreur lors du chargement des ventes:', error);
            toast.error('Erreur lors du chargement des ventes');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSales = sales.filter(sale => {
        const firstItem = sale.items && sale.items.length > 0 ? sale.items[0] : null;
        const matchesSearch = sale.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            firstItem?.product?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || (sale as any).statut === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return { label: 'Terminée', variant: 'default' as const };
            case 'pending':
                return { label: 'En attente', variant: 'secondary' as const };
            case 'cancelled':
                return { label: 'Annulée', variant: 'destructive' as const };
            default:
                return { label: status, variant: 'outline' as const };
        }
    };

    const getTotalSales = () => {
        return sales.reduce((total, sale) => total + (sale.montantTotal || 0), 0);
    };

    const getCompletedSales = () => {
        return sales.filter(sale => (sale as any).statut === 'completed').length;
    };

    const getPendingSales = () => {
        return sales.filter(sale => (sale as any).statut === 'pending').length;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Mes Ventes</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-20 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <MainLayout
            title="Mes Ventes"
            subtitle="Consultez l'historique de vos ventes"
        >
            <div className="space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{sales.length}</p>
                                    <p className="text-sm text-muted-foreground">Total ventes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {(getTotalSales() || 0).toLocaleString()} FCFA
                                    </p>
                                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">{getCompletedSales()}</p>
                                    <p className="text-sm text-muted-foreground">Ventes terminées</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">{getPendingSales()}</p>
                                    <p className="text-sm text-muted-foreground">En attente</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher par client ou produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="completed">Terminées</option>
                                    <option value="pending">En attente</option>
                                    <option value="cancelled">Annulées</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Historique des ventes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Quantité</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Détails</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSales.map((sale) => {
                                    const statusBadge = getStatusBadge((sale as any).statut || 'completed');
                                    const firstItem = sale.items && sale.items.length > 0 ? sale.items[0] : null;
                                    return (
                                        <TableRow key={sale.id}>
                                            <TableCell>
                                                {new Date(sale.dateDVente).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {sale.clientNom || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {firstItem?.product?.nom || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {firstItem?.quantite || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-medium text-green-600">
                                                {(sale.montantTotal || 0).toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadge.variant}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                                    onClick={() => setSelectedSale(sale)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>Voir</span>
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {filteredSales.length === 0 && (
                            <div className="text-center py-8">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchTerm || filterStatus !== 'all'
                                        ? 'Aucune vente trouvée avec ces critères'
                                        : 'Aucune vente enregistrée pour le moment'
                                    }
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sale Details Modal */}
                {selectedSale && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-2xl mx-4">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Détails de la vente
                                    <button
                                        onClick={() => setSelectedSale(null)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        ✕
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date de vente</label>
                                        <p className="text-lg font-semibold">
                                            {new Date(selectedSale.dateDVente).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Statut</label>
                                        <p>
                                            <Badge variant={getStatusBadge((selectedSale as any).statut || 'completed').variant}>
                                                {getStatusBadge((selectedSale as any).statut || 'completed').label}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Client</label>
                                        <p className="text-lg font-semibold">{selectedSale.clientNom || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Produit</label>
                                        <p className="text-lg font-semibold">{selectedSale.items[0]?.product?.nom || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Quantité</label>
                                        <p className="text-lg font-semibold">{selectedSale.items[0]?.quantite}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Montant total</label>
                                        <p className="text-lg font-semibold text-green-600">
                                            {(selectedSale.montantTotal || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                                {(selectedSale as any).notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                        <p className="text-sm">{(selectedSale as any).notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ArtisanSalesPage;
