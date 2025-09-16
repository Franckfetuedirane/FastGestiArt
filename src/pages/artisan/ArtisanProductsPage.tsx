import React, { useState, useEffect } from 'react';
import { Package, Eye, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
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
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ArtisanProductsPage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productService.getAll(user?.id);
            setProducts(data);
        } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
            toast.error('Erreur lors du chargement des produits');
        } finally {
            setIsLoading(false);
        }
    };


    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.categorie === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Rupture', variant: 'destructive' as const };
        if (stock < 10) return { label: 'Stock faible', variant: 'secondary' as const };
        return { label: 'En stock', variant: 'default' as const };
    };

    const getCategories = () => {
        const categories = [...new Set(products.map(p => p.categorie))];
        return categories;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Mes Produits</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-32 bg-muted rounded mb-4"></div>
                                <div className="h-4 bg-muted rounded mb-2"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <MainLayout
            title="Mes Produits"
            subtitle="Consultez votre inventaire et vos produits"
        >
            <div className="space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{products.length}</p>
                                    <p className="text-sm text-muted-foreground">Total produits</p>
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
                                        {products.filter(p => p.stock > 10).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">En stock</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <TrendingDown className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {products.filter(p => p.stock > 0 && p.stock <= 10).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Stock faible</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-8 w-8 text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {products.filter(p => p.stock === 0).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Rupture</p>
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
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="all">Toutes les catégories</option>
                                    {getCategories().map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Prix</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Détails</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{product.nom}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {product.description?.substring(0, 50)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{product.categorie}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.prix.toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {product.stock} unités
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={stockStatus.variant}>
                                                    {stockStatus.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                                    onClick={() => setSelectedProduct(product)}
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

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchTerm || filterCategory !== 'all'
                                        ? 'Aucun produit trouvé avec ces critères'
                                        : 'Aucun produit créé pour le moment'
                                    }
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Product Details Modal */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-2xl mx-4">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Détails du produit
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        ✕
                                    </button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nom</label>
                                        <p className="text-lg font-semibold">{selectedProduct.nom}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                                        <p><Badge variant="outline">{selectedProduct.categorie}</Badge></p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Prix</label>
                                        <p className="text-lg font-semibold text-green-600">
                                            {selectedProduct.prix.toLocaleString()} FCFA
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Stock</label>
                                        <p className="text-lg font-semibold">{selectedProduct.stock} unités</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-sm">{selectedProduct.description}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                                    <p className="text-sm">
                                        {new Date(selectedProduct.dateCreation).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ArtisanProductsPage;
