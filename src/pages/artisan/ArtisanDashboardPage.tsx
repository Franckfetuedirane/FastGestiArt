import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtisanDashboard } from '@/components/dashboard/ArtisanDashboard';

const ArtisanDashboardPage: React.FC = () => {
  return (
    <MainLayout 
      title="Mon Dashboard" 
      subtitle="Gérez votre activité artisanale"
    >
      <ArtisanDashboard />
    </MainLayout>
  );
};

export default ArtisanDashboardPage;