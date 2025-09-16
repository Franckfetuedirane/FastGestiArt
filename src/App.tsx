// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { APIAutoDetector } from "@/components/APIAutoDetector";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ArtisanDashboardPage from "./pages/artisan/ArtisanDashboardPage";
import ArtisanProductsPage from "./pages/artisan/ArtisanProductsPage";
import ArtisanSalesPage from "./pages/artisan/ArtisanSalesPage";
import ArtisanProfilPage from "./pages/artisan/ArtisanProfilPage";
import ProductsPage from "./pages/admin/ProductsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import SalesPage from "./pages/admin/SalesPage";
import ArtisansPage from "./pages/admin/ArtisansPage";
import UsersPage from "./pages/admin/UsersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <APIAutoDetector />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/produits" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoriesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/ventes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SalesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/artisans" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ArtisansPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/utilisateurs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/rapports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } />

            {/* Artisan Routes */}
            <Route path="/artisan" element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <Navigate to="/artisan/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/artisan/dashboard" element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <ArtisanDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/artisan/produits" element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <ArtisanProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/artisan/ventes" element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <ArtisanSalesPage />
              </ProtectedRoute>
            } />
            <Route path="/artisan/profil" element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <ArtisanProfilPage />
              </ProtectedRoute>
            } />

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;