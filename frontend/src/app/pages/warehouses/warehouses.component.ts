import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaginationMeta, Warehouse } from '../../models/api.models';
import { WarehouseService } from '../../services/warehouse.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.css',
})
export class WarehousesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly warehouseService = inject(WarehouseService);

  warehouses: Warehouse[] = [];
  allWarehouses: Warehouse[] = [];
  selectedId = '';
  editingId = '';
  loading = false;
  saving = false;
  error = '';
  success = '';
  page = 1;
  limit = 5;
  meta: PaginationMeta | null = null;
  locationFilter = '';

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
    this.loadAllOptions();
  }

  get isEditing(): boolean {
    return Boolean(this.editingId);
  }

  loadWarehouses(): void {
    this.loading = true;
    this.error = '';
    this.warehouseService.list(this.page, this.limit, this.locationFilter).subscribe({
      next: (result) => {
        this.warehouses = result.items;
        this.meta = result.meta;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to load warehouses');
        this.loading = false;
      },
    });
  }

  applyLocationFilter(): void {
    this.page = 1;
    this.loadWarehouses();
  }

  clearLocationFilter(): void {
    this.locationFilter = '';
    this.page = 1;
    this.loadWarehouses();
  }

  loadAllOptions(): void {
    this.warehouseService.listOptions().subscribe({
      next: (data) => {
        this.allWarehouses = data;
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to load warehouse options');
      },
    });
  }

  goToPage(page: number): void {
    if (!this.meta) return;
    if (page < 1 || page > this.meta.totalPages) return;
    this.page = page;
    this.loadWarehouses();
  }

  resetWarehouseForm(): void {
    this.editingId = '';
    this.warehouseForm.reset({ name: '', code: '', location: '' });
  }

  startEdit(warehouse: Warehouse): void {
    this.editingId = warehouse._id;
    this.selectedId = warehouse._id;
    this.warehouseForm.setValue({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location || '',
    });
    this.error = '';
    this.success = '';
  }

  submitWarehouse(): void {
    if (this.warehouseForm.invalid) {
      this.warehouseForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    const payload = this.warehouseForm.getRawValue();

    const request$ = this.isEditing
      ? this.warehouseService.update(this.editingId, payload)
      : this.warehouseService.create(payload);

    request$.subscribe({
      next: (warehouse) => {
        this.success = this.isEditing
          ? `Warehouse ${warehouse.code} updated`
          : `Warehouse ${warehouse.code} created`;
        this.resetWarehouseForm();
        this.selectedId = warehouse._id;
        this.saving = false;
        this.loadWarehouses();
        this.loadAllOptions();
      },
      error: (err) => {
        this.error = getErrorMessage(
          err,
          this.isEditing ? 'Failed to update warehouse' : 'Failed to create warehouse'
        );
        this.saving = false;
      },
    });
  }

  deleteWarehouse(warehouse: Warehouse): void {
    const confirmed = window.confirm(
      `Delete warehouse ${warehouse.code}? This cannot be undone.`
    );
    if (!confirmed) return;

    this.saving = true;
    this.error = '';
    this.success = '';
    this.warehouseService.remove(warehouse._id).subscribe({
      next: () => {
        this.success = `Warehouse ${warehouse.code} deleted`;
        if (this.selectedId === warehouse._id) {
          this.selectedId = '';
        }
        if (this.editingId === warehouse._id) {
          this.resetWarehouseForm();
        }
        this.saving = false;
        if (this.warehouses.length === 1 && this.page > 1) {
          this.page -= 1;
        }
        this.loadWarehouses();
        this.loadAllOptions();
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to delete warehouse');
        this.saving = false;
      },
    });
  }

  selectWarehouse(id: string): void {
    this.selectedId = id;
    this.error = '';
    this.success = '';
  }

  editStock(item: { sku: string; name: string; quantity: number }, warehouseId: string): void {
    this.selectedId = warehouseId;
    this.stockForm.setValue({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
    });
  }

  deleteStock(warehouse: Warehouse, sku: string): void {
    const confirmed = window.confirm(`Delete stock item ${sku} from ${warehouse.code}?`);
    if (!confirmed) return;

    this.saving = true;
    this.error = '';
    this.success = '';
    this.warehouseService.deleteStock(warehouse._id, sku).subscribe({
      next: () => {
        this.success = `Stock ${sku} deleted`;
        this.saving = false;
        this.loadWarehouses();
        this.loadAllOptions();
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to delete stock');
        this.saving = false;
      },
    });
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
          this.loadAllOptions();
        },
        error: (err) => {
          this.error = getErrorMessage(err, 'Failed to update stock');
          this.saving = false;
        },
      });
  }
}
