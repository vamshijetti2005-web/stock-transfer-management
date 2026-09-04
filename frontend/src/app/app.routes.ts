import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { WarehousesComponent } from './pages/warehouses/warehouses.component';
import { TransfersComponent } from './pages/transfers/transfers.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'warehouses', component: WarehousesComponent },
      { path: 'transfers', component: TransfersComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
