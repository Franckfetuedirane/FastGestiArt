export const API_CONFIG = {
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false', // Par défaut en mode mock
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000, // 10 secondes de timeout
  RETRY_ATTEMPTS: 3,
};

// Fonction pour vérifier si l'API Django est accessible
export const checkDjangoAPI = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.API_URL}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Fonction pour tester la connexion à l'API
export const testAPIConnection = async (): Promise<boolean> => {
  if (API_CONFIG.USE_MOCK) {
    console.log('Mode mock activé - pas de test de connexion API');
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(`${API_CONFIG.API_URL}/health/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Connexion API Django réussie');
      return true;
    } else {
      console.warn(`⚠️ API Django répond avec le statut: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Timeout de connexion à l\'API Django');
    } else {
      console.error('❌ Erreur de connexion à l\'API Django:', error);
    }
    return false;
  }
};