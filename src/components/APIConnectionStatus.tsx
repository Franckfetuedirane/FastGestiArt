import React, { useState, useEffect } from 'react';
import { testAPIConnection, API_CONFIG } from '@/config/api.config';

interface APIConnectionStatusProps {
    className?: string;
}

export const APIConnectionStatus: React.FC<APIConnectionStatusProps> = ({ className = '' }) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    const checkConnection = async () => {
        setIsLoading(true);
        try {
            const connected = await testAPIConnection();
            setIsConnected(connected);
            setLastCheck(new Date());
        } catch (error) {
            console.error('Erreur lors du test de connexion:', error);
            setIsConnected(false);
            setLastCheck(new Date());
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const getStatusColor = () => {
        if (isLoading) return 'text-yellow-600';
        if (isConnected === null) return 'text-gray-600';
        return isConnected ? 'text-green-600' : 'text-red-600';
    };

    const getStatusText = () => {
        if (API_CONFIG.USE_MOCK) return 'Mode Mock Activé';
        if (isLoading) return 'Test en cours...';
        if (isConnected === null) return 'Statut inconnu';
        return isConnected ? 'API Connectée' : 'API Déconnectée';
    };

    const getStatusIcon = () => {
        if (API_CONFIG.USE_MOCK) return '📦';
        if (isLoading) return '⏳';
        if (isConnected === null) return '❓';
        return isConnected ? '✅' : '❌';
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <span className="text-sm">
                {getStatusIcon()} {getStatusText()}
            </span>
            {!API_CONFIG.USE_MOCK && (
                <button
                    onClick={checkConnection}
                    disabled={isLoading}
                    className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded disabled:opacity-50"
                >
                    {isLoading ? 'Test...' : 'Tester'}
                </button>
            )}
            {lastCheck && (
                <span className="text-xs text-gray-500">
                    Dernière vérification: {lastCheck.toLocaleTimeString()}
                </span>
            )}
        </div>
    );
};
