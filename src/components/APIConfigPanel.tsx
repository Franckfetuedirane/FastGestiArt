import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { API_CONFIG, testAPIConnection } from '@/config/api.config';

interface APIConfigPanelProps {
    className?: string;
}

export const APIConfigPanel: React.FC<APIConfigPanelProps> = ({ className = '' }) => {
    const [apiUrl, setApiUrl] = useState(API_CONFIG.API_URL);
    const [useMock, setUseMock] = useState(API_CONFIG.USE_MOCK);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            // Temporairement changer la config pour le test
            const originalUrl = API_CONFIG.API_URL;
            API_CONFIG.API_URL = apiUrl;
            API_CONFIG.USE_MOCK = false;

            const isConnected = await testAPIConnection();
            setTestResult(isConnected ? '✅ Connexion réussie' : '❌ Connexion échouée');

            // Restaurer la config originale
            API_CONFIG.API_URL = originalUrl;
            API_CONFIG.USE_MOCK = useMock;
        } catch (error) {
            setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveConfig = () => {
        // En production, ces valeurs seraient sauvegardées dans localStorage ou un service de config
        localStorage.setItem('gestiart_api_url', apiUrl);
        localStorage.setItem('gestiart_use_mock', useMock.toString());

        // Mettre à jour la config actuelle
        API_CONFIG.API_URL = apiUrl;
        API_CONFIG.USE_MOCK = useMock;

        alert('Configuration sauvegardée ! Redémarrez l\'application pour appliquer les changements.');
    };

    useEffect(() => {
        // Charger la config depuis localStorage
        const savedUrl = localStorage.getItem('gestiart_api_url');
        const savedMock = localStorage.getItem('gestiart_use_mock');

        if (savedUrl) setApiUrl(savedUrl);
        if (savedMock) setUseMock(savedMock === 'true');
    }, []);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Configuration API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="api-url">URL de l'API Django</Label>
                    <Input
                        id="api-url"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="http://localhost:8000/api"
                        disabled={useMock}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="use-mock"
                        checked={useMock}
                        onCheckedChange={setUseMock}
                    />
                    <Label htmlFor="use-mock">Utiliser les données mock</Label>
                </div>

                {!useMock && (
                    <div className="space-y-2">
                        <Button
                            onClick={handleTestConnection}
                            disabled={isTesting}
                            variant="outline"
                            className="w-full"
                        >
                            {isTesting ? 'Test en cours...' : 'Tester la connexion'}
                        </Button>

                        {testResult && (
                            <div className="text-sm p-2 bg-muted rounded">
                                {testResult}
                            </div>
                        )}
                    </div>
                )}

                <Button onClick={handleSaveConfig} className="w-full">
                    Sauvegarder la configuration
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Mode Mock:</strong> Utilise des données simulées pour le développement</p>
                    <p><strong>Mode API:</strong> Se connecte à l'API Django réelle</p>
                    <p><strong>URL actuelle:</strong> {API_CONFIG.API_URL}</p>
                </div>
            </CardContent>
        </Card>
    );
};
