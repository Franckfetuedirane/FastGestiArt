import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'artisan'],
  requireAuth = true 
}) => {
  const { user } = useAuth();

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté mais n'a pas les permissions requises
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirection vers le dashboard approprié selon le rôle
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/artisan/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};