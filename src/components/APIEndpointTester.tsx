import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_CONFIG } from '@/config/api.config';

interface EndpointTestResult {
    endpoint: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    responseTime?: number;
}

export const APIEndpointTester: React.FC = () => {
    const [results, setResults] = useState<EndpointTestResult[]>([]);
    const [isTesting, setIsTesting] = useState(false);

    const endpoints = [
        { name: 'Ventes', url: '/ventes/' },
        { name: 'Produits', url: '/produits/' },
        { name: 'Artisans', url: '/artisans/' },
        { name: 'Register', url: '/register/' },
        { name: 'Users', url: '/users/' },
        { name: 'Health', url: '/health/' }
    ];

    const testEndpoint = async (endpoint: { name: string; url: string }): Promise<EndpointTestResult> => {
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(`${API_CONFIG.API_URL}${endpoint.url}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            if (response.ok) {
                return {
                    endpoint: endpoint.name,
                    status: 'success',
                    message: `✅ ${response.status} - ${response.statusText}`,
                    responseTime
                };
            } else {
                return {
                    endpoint: endpoint.name,
                    status: 'error',
                    message: `❌ ${response.status} - ${response.statusText}`,
                    responseTime
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            let message = '❌ Erreur de connexion';

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    message = '❌ Timeout';
                } else if (error.message.includes('Failed to fetch')) {
                    message = '❌ API Django non accessible - Vérifiez que le serveur est démarré';
                } else {
                    message = `❌ ${error.message}`;
                }
            }

            return {
                endpoint: endpoint.name,
                status: 'error',
                message,
                responseTime
            };
        }
    };

    const testAllEndpoints = async () => {
        setIsTesting(true);
        setResults([]);

        for (const endpoint of endpoints) {
            setResults(prev => [...prev, {
                endpoint: endpoint.name,
                status: 'pending',
                message: '⏳ Test en cours...'
            }]);

            const result = await testEndpoint(endpoint);

            setResults(prev => prev.map(r =>
                r.endpoint === endpoint.name ? result : r
            ));

            // Petite pause entre les tests
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setIsTesting(false);
    };

    const getStatusBadge = (status: EndpointTestResult['status']) => {
        switch (status) {
            case 'success':
                return <Badge variant="default" className="bg-green-600">Succès</Badge>;
            case 'error':
                return <Badge variant="destructive">Erreur</Badge>;
            case 'pending':
                return <Badge variant="secondary">En cours</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    Test des Endpoints API
                    <Button
                        onClick={testAllEndpoints}
                        disabled={isTesting}
                        variant="outline"
                    >
                        {isTesting ? 'Test en cours...' : 'Tester tous les endpoints'}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p><strong>URL de base :</strong> {API_CONFIG.API_URL}</p>
                        <p><strong>Mode :</strong> {API_CONFIG.USE_MOCK ? 'Mock' : 'API Réelle'}</p>

                        {!API_CONFIG.USE_MOCK && results.some(r => r.status === 'error') && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                <p className="text-yellow-800 font-medium">💡 API Django non accessible</p>
                                <p className="text-yellow-700 text-xs mt-1">
                                    Pour utiliser l'API Django, assurez-vous que le serveur est démarré :
                                </p>
                                <code className="text-xs bg-yellow-100 px-2 py-1 rounded mt-1 block">
                                    python manage.py runserver
                                </code>
                                <p className="text-yellow-700 text-xs mt-2">
                                    Ou basculez en mode mock dans les paramètres ci-dessus.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {endpoints.map((endpoint) => {
                            const result = results.find(r => r.endpoint === endpoint.name);
                            return (
                                <div key={endpoint.name} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">{endpoint.name}</h4>
                                        {result && getStatusBadge(result.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {endpoint.url}
                                    </p>
                                    {result && (
                                        <div className="text-sm">
                                            <p>{result.message}</p>
                                            {result.responseTime && (
                                                <p className="text-muted-foreground">
                                                    Temps de réponse: {result.responseTime}ms
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
