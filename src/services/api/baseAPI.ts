import { API_CONFIG } from '@/config/api.config';

export const createAPIService = <T>(
  mockData: T[],
  endpoint: string,
  mockDelay: number = 500
) => {
  const getAuthHeader = (email: string, password: string) => ({
    Authorization: `Basic ${btoa(`${email}:${password}`)}`,
  });

  // Fonction pour gérer les erreurs avec retry
  const handleAPIError = async (error: any, retryCount: number = 0): Promise<never> => {
    console.error(`Erreur API (tentative ${retryCount + 1}):`, error);

    if (retryCount < API_CONFIG.RETRY_ATTEMPTS && !API_CONFIG.USE_MOCK) {
      console.log(`Nouvelle tentative dans 1 seconde...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw error; // Relancer pour retry
    }

    throw new Error(`Erreur API après ${API_CONFIG.RETRY_ATTEMPTS} tentatives: ${error.message}`);
  };

  return {
    getAll: async (email?: string, password?: string): Promise<T[]> => {
      if (API_CONFIG.USE_MOCK) {
        console.log(`📦 Mode mock: récupération de ${mockData.length} éléments depuis ${endpoint}`);
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockData), mockDelay);
        });
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(`${API_CONFIG.API_URL}/${endpoint}/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(email && password ? getAuthHeader(email, password) : {}),
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erreur API ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ API: récupération réussie de ${data.length || 0} éléments depuis ${endpoint}`);
        return data;
      } catch (error) {
        return handleAPIError(error);
      }
    },

    create: async (data: Omit<T, 'id'>, email?: string, password?: string): Promise<T> => {
      if (API_CONFIG.USE_MOCK) {
        const newItem = {
          ...data,
          id: `mock-${Date.now()}`,
        } as T;
        mockData.push(newItem);
        console.log(`📦 Mode mock: création d'un nouvel élément dans ${endpoint}`);
        return new Promise((resolve) => {
          setTimeout(() => resolve(newItem), mockDelay);
        });
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(`${API_CONFIG.API_URL}/${endpoint}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(email && password ? getAuthHeader(email, password) : {}),
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erreur API ${response.status}: ${response.statusText}`);
        }

        const newItem = await response.json();
        console.log(`✅ API: création réussie d'un nouvel élément dans ${endpoint}`);
        return newItem;
      } catch (error) {
        return handleAPIError(error);
      }
    },

    // ... autres méthodes CRUD
  };
};