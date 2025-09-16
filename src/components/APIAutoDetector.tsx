import React, { useEffect, useState } from 'react';
import { API_CONFIG, checkDjangoAPI } from '@/config/api.config';
import { toast } from 'sonner';

export const APIAutoDetector: React.FC = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const autoDetectAPI = async () => {
            // Ne vérifier que si on n'est pas déjà en mode mock
            if (API_CONFIG.USE_MOCK) {
                setHasChecked(true);
                return;
            }

            setIsChecking(true);

            try {
                const isDjangoAccessible = await checkDjangoAPI();

                if (!isDjangoAccessible) {
                    // Basculer automatiquement en mode mock
                    API_CONFIG.USE_MOCK = true;
                    localStorage.setItem('gestiart_use_mock', 'true');

                    toast.warning(
                        'API Django non accessible - Basculement automatique en mode mock',
                        {
                            description: 'L\'API Django n\'est pas accessible. L\'application utilise les données simulées.',
                            duration: 5000,
                        }
                    );

                    console.log('🔄 Basculement automatique en mode mock - API Django non accessible');
                } else {
                    console.log('✅ API Django accessible - Mode API activé');
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'API:', error);

                // En cas d'erreur, basculer en mode mock
                API_CONFIG.USE_MOCK = true;
                localStorage.setItem('gestiart_use_mock', 'true');

                toast.error(
                    'Erreur de connexion - Basculement en mode mock',
                    {
                        description: 'Impossible de vérifier l\'API Django. Mode mock activé.',
                        duration: 5000,
                    }
                );
            } finally {
                setIsChecking(false);
                setHasChecked(true);
            }
        };

        // Vérifier seulement si on n'a pas encore vérifié
        if (!hasChecked) {
            autoDetectAPI();
        }
    }, [hasChecked]);

    // Ce composant ne rend rien, il fait juste la détection automatique
    return null;
};
