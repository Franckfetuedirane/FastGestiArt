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
  Palette
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
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Produits',
    url: '/admin/produits',
    icon: Package,
  },
  {
    title: 'Catégories',
    url: '/admin/categories',
    icon: FolderOpen,
  },
  {
    title: 'Ventes',
    url: '/admin/ventes',
    icon: ShoppingCart,
  },
  {
    title: 'Artisans',
    url: '/admin/artisans',
    icon: Users,
  },
  {
    title: 'Rapports',
    url: '/admin/rapports',
    icon: FileBarChart,
  },
];

// Navigation items for Artisan
const artisanNavItems = [
  {
    title: 'Dashboard',
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

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === 'collapsed';

  // Determine navigation items based on user role
  const navItems = user?.role === 'admin' ? adminNavItems : artisanNavItems;

  const handleLogout = () => {
    logout();
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
                  {user?.role === 'admin' ? 'Administrateur' : 'Artisan'}
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
          {!collapsed && user?.profile && (
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile.photo} alt={user.profile.prenom} />
                <AvatarFallback className="bg-gradient-accent text-accent-foreground text-xs">
                  {user.profile.prenom[0]}{user.profile.nom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-primary truncate">
                  {user.profile.prenom} {user.profile.nom}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {user.profile.specialite || user.email}
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