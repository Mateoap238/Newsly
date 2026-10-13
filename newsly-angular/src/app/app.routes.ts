import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', loadComponent: () => import('./pages/home/home').then((m) => m.Home), title: 'Newsly · Inicio' },
  { path: 'noticias', loadComponent: () => import('./pages/noticias/noticias').then((m) => m.NoticiasPage), title: 'Newsly · Noticias' },
  { path: 'detalle/:id', loadComponent: () => import('./pages/detalle/detalle').then((m) => m.Detalle), title: 'Newsly · Detalle' },
  { path: 'nosotros', loadComponent: () => import('./pages/nosotros/nosotros').then((m) => m.Nosotros), title: 'Newsly · Nosotros' },
  { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto').then((m) => m.Contacto), title: 'Newsly · Contacto' },
  { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos').then((m) => m.Favoritos), title: 'Newsly · Favoritos' },
  { path: 'administracion', loadComponent: () => import('./pages/administracion/administracion').then((m) => m.Administracion), title: 'Newsly · Gestión' },
  { path: '**', redirectTo: 'inicio' },
];
