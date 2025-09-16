# Configuration de l'API Django - GestiArt Hub

## Vue d'ensemble

L'application GestiArt Hub peut fonctionner en deux modes :
- **Mode Mock** : Utilise des données simulées pour le développement
- **Mode API** : Se connecte à l'API Django réelle

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configuration API Django
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=false

# Configuration de développement
VITE_DEV_MODE=true
```

### Variables disponibles

- `VITE_API_URL` : URL de base de l'API Django (défaut: `http://localhost:8000/api`)
- `VITE_USE_MOCK` : Active/désactive le mode mock (défaut: `true`)

## Interface de configuration

L'application inclut une interface de configuration accessible via :
- **Admin** : Menu "Paramètres" dans la sidebar
- **Composant de statut** : Affiché dans le dashboard principal

### Fonctionnalités de l'interface

1. **Test de connexion** : Vérifie si l'API Django est accessible
2. **Basculement de mode** : Active/désactive le mode mock
3. **Configuration d'URL** : Modifie l'URL de l'API
4. **Sauvegarde** : Persiste les paramètres dans localStorage

## Endpoints API attendus

L'API Django doit exposer les endpoints suivants :

### Authentification
- `POST /api/login/` - Connexion utilisateur
- `POST /api/register/` - Inscription utilisateur
- `GET /api/health/` - Test de santé de l'API

### Données principales
- `GET /api/produits/` - Liste des produits
- `POST /api/produits/` - Création d'un produit
- `GET /api/artisans/` - Liste des artisans
- `POST /api/artisans/` - Création d'un artisan
- `GET /api/ventes/` - Liste des ventes
- `POST /api/ventes/` - Création d'une vente

### Authentification API

L'application utilise l'authentification Basic Auth avec les headers :
```
Authorization: Basic <base64(email:password)>
```

## Gestion d'erreurs

### Fonctionnalités implémentées

1. **Timeout** : 10 secondes par défaut
2. **Retry automatique** : 3 tentatives maximum
3. **Messages d'erreur détaillés** : Différenciation des codes d'erreur
4. **Logs de débogage** : Affichage dans la console

### Codes d'erreur gérés

- `401` : Email ou mot de passe incorrect
- `404` : Ressource non trouvée
- `500` : Erreur serveur
- `Timeout` : Délai d'attente dépassé

## Développement

### Mode Mock

En mode mock, l'application :
- Utilise les données du fichier `src/data/mockData.ts`
- Simule les délais de réponse (500ms par défaut)
- Affiche des logs avec l'icône 📦

### Mode API

En mode API, l'application :
- Effectue de vrais appels HTTP vers Django
- Gère l'authentification
- Affiche des logs avec l'icône ✅/❌

## Dépannage

### Problèmes courants

1. **API non accessible**
   - Vérifiez que Django est démarré
   - Vérifiez l'URL dans la configuration
   - Testez avec le bouton "Tester la connexion"

2. **Erreurs d'authentification**
   - Vérifiez les credentials
   - Vérifiez la configuration CORS dans Django
   - Vérifiez les headers d'authentification

3. **Données non chargées**
   - Vérifiez les logs de la console
   - Vérifiez les endpoints Django
   - Testez avec un client HTTP (Postman, curl)

### Logs utiles

Les logs de l'application incluent :
- `📦 Mode mock: ...` - Opérations en mode mock
- `✅ API: ...` - Opérations API réussies
- `❌ Erreur API: ...` - Erreurs API
- `⏳ Test en cours...` - Tests de connexion

## Migration vers l'API réelle

Pour passer du mode mock à l'API réelle :

1. Configurez l'API Django avec les endpoints requis
2. Modifiez `VITE_USE_MOCK=false` dans `.env`
3. Redémarrez l'application
4. Testez la connexion via l'interface
5. Vérifiez les logs pour confirmer le fonctionnement
