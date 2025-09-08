import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <MainLayout 
      title="Dashboard Administrateur" 
      subtitle="Vue d'ensemble de votre plateforme GestiArt"
    >
      <AdminDashboard />
    </MainLayout>
  );
};

export default AdminDashboardPage;