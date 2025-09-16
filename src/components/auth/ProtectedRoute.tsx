// src/components/auth/ProtectedRoute.tsx
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// Suppression de l'import inutilisé de UserRole

type AllowedRole = 'admin' | 'artisan' | 'secondary_admin';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AllowedRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'artisan'],
  requireAuth = true 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Si le chargement est en cours, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !user) {
    // Rediriger vers la page de connexion avec l'URL de redirection
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté mais n'a pas les permissions requises
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.user_type as AllowedRole)) {
    console.warn(`Accès refusé: L'utilisateur n'a pas le rôle requis. Rôle actuel: ${user.user_type}, Rôles autorisés:`, allowedRoles);
    
    // Redirection vers le tableau de bord approprié selon le rôle de l'utilisateur
    let redirectPath = '/dashboard';
    
    if (user.user_type === 'admin' || user.user_type === 'secondary_admin') {
      redirectPath = '/admin/dashboard';
    } else if (user.user_type === 'artisan') {
      redirectPath = '/artisan/dashboard';
    }
      
    return <Navigate to={redirectPath} replace />;
  }

  // Si l'utilisateur est autorisé, afficher le contenu protégé
  return <>{children}</>;
};