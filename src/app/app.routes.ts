import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory.page').then(m => m.InventoryPage)
      },
      {
        path: 'tambah',
        loadComponent: () => import('./pages/tambah/tambah.page').then(m => m.TambahPage)
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage)
      },
      {
        path: 'laporan',
        loadComponent: () => import('./pages/laporan/laporan.page').then(m => m.LaporanPage)
      }
    ]
  },
  {
    path: 'home',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
