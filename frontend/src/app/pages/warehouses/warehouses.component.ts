import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Warehouse } from '../../models/api.models';
import { WarehouseService } from '../../services/warehouse.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.css',
})
export class WarehousesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly warehouseService = inject(WarehouseService);

  warehouses: Warehouse[] = [];
  selectedId = '';
  loading = false;
  saving = false;
  error = '';
  success = '';

  readonly warehouseForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.minLength(2)]],
    location: [''],
  });

  readonly stockForm = this.fb.nonNullable.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadWarehouses();
  }

  get selectedWarehouse(): Warehouse | undefined {
    return this.warehouses.find((w) => w._id === this.selectedId);
  }

  loadWarehouses(): void {
    this.loading = true;
    this.error = '';
    this.warehouseService.list().subscribe({
      next: (data) => {
        this.warehouses = data;
        if (this.selectedId && !data.some((w) => w._id === this.selectedId)) {
          this.selectedId = '';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to load warehouses');
        this.loading = false;
      },
    });
  }

  createWarehouse(): void {
    if (this.warehouseForm.invalid) {
      this.warehouseForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    this.warehouseService.create(this.warehouseForm.getRawValue()).subscribe({
      next: (warehouse) => {
        this.success = `Warehouse ${warehouse.code} created`;
        this.warehouseForm.reset({ name: '', code: '', location: '' });
        this.selectedId = warehouse._id;
        this.saving = false;
        this.loadWarehouses();
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to create warehouse');
        this.saving = false;
      },
    });
  }

  selectWarehouse(id: string): void {
    this.selectedId = id;
    this.error = '';
    this.success = '';
  }

  saveStock(): void {
    if (!this.selectedId) {
      this.error = 'Select a warehouse first';
      return;
    }
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    const payload = this.stockForm.getRawValue();
    this.warehouseService
      .upsertStock(this.selectedId, {
        sku: payload.sku,
        name: payload.name,
        quantity: Number(payload.quantity),
      })
      .subscribe({
        next: (warehouse) => {
          this.success = `Stock updated for ${warehouse.code}`;
          this.stockForm.reset({ sku: '', name: '', quantity: 0 });
          this.saving = false;
          this.loadWarehouses();
        },
        error: (err) => {
          this.error = getErrorMessage(err, 'Failed to update stock');
          this.saving = false;
        },
      });
  }
}
