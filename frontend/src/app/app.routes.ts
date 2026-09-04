import { Routes } from '@angular/router';
import { WarehousesComponent } from './pages/warehouses/warehouses.component';
import { TransfersComponent } from './pages/transfers/transfers.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'warehouses' },
  { path: 'warehouses', component: WarehousesComponent },
  { path: 'transfers', component: TransfersComponent },
  { path: '**', redirectTo: 'warehouses' },
];
