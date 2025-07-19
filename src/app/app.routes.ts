import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/countries',
    pathMatch: 'full'
  },
  {
    path: 'countries',
    loadComponent: () => import('./pages/countries-list/countries-list.component').then(m => m.CountriesListComponent)
  },
  {
    path: 'country/:code',
    loadComponent: () => import('./pages/country-detail/country-detail.component').then(m => m.CountryDetailComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites-dashboard/favorites-dashboard.component').then(m => m.FavoritesDashboardComponent)
  },
  {
    path: '**',
    redirectTo: '/countries'
  }
];