import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardStats, Warehouse } from '../../models/api.models';
import { DashboardService } from '../../services/dashboard.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats: DashboardStats | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to load dashboard');
        this.loading = false;
      },
    });
  }

  warehouseLabel(value: Warehouse | string): string {
    if (typeof value === 'string') return value;
    return `${value.code}`;
  }
}
