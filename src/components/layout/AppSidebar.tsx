// src/components/layout/AppSidebar.tsx
import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  FileBarChart,
  UserCircle,
  LogOut,
  Palette,
  Shield,
  Settings
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

// Navigation items for Admin
const adminNavItems = [
  {
    title: 'Tableau de bord',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Produits',
    url: '/admin/produits',
    icon: Package,
  },
  {
    title: 'Artisans',
    url: '/admin/artisans',
    icon: Users,
  },
  {
    title: 'Ventes',
    url: '/admin/ventes',
    icon: ShoppingCart,
  },
  {
    title: 'Catégories',
    url: '/admin/categories',
    icon: FolderOpen,
  },
  {
    title: 'Utilisateurs',
    url: '/admin/utilisateurs',
    icon: Shield,
  },
  {
    title: 'Rapports',
    url: '/admin/rapports',
    icon: FileBarChart,
  },
  {
    title: 'Paramètres',
    url: '/admin/parametres',
    icon: Settings,
  },
];

// Navigation items for Artisan
const artisanNavItems = [
  {
    title: 'Tableau de bord',
    url: '/artisan/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mes Produits',
    url: '/artisan/produits',
    icon: Package,
  },
  {
    title: 'Mes Ventes',
    url: '/artisan/ventes',
    icon: ShoppingCart,
  },
  {
    title: 'Mon Profil',
    url: '/artisan/profil',
    icon: UserCircle,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath.startsWith(path);
  const collapsed = state === 'collapsed';

  // Determine navigation items based on user role
  const navItems = user?.user_type === 'admin' ? adminNavItems : artisanNavItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-primary">GestiArt</h2>
                <p className="text-xs text-sidebar-foreground/70 capitalize">
                  {user?.user_type === 'admin' ? 'Administrateur' : 'Artisan'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photo} alt={`${user.prenom} ${user.nom}`} />
                <AvatarFallback className="bg-gradient-accent text-accent-foreground text-xs">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-primary truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}