import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  StockItem,
  Transfer,
  TransferStatus,
  Warehouse,
} from '../../models/api.models';
import { TransferService } from '../../services/transfer.service';
import { WarehouseService } from '../../services/warehouse.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.css',
})
export class TransfersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly warehouseService = inject(WarehouseService);
  private readonly transferService = inject(TransferService);

  warehouses: Warehouse[] = [];
  transfers: Transfer[] = [];
  availableSkus: StockItem[] = [];
  expandedId = '';
  loading = false;
  saving = false;
  error = '';
  success = '';
  statusFilter: TransferStatus | '' = '';

  readonly transferForm = this.fb.nonNullable.group({
    fromWarehouseId: ['', Validators.required],
    toWarehouseId: ['', Validators.required],
    sku: ['', Validators.required],
    name: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadTransfers();

    this.transferForm.controls.fromWarehouseId.valueChanges.subscribe((id) => {
      this.onSourceWarehouseChange(id);
    });
  }

  loadWarehouses(): void {
    this.warehouseService.list().subscribe({
      next: (data) => {
        this.warehouses = data;
        const currentSource = this.transferForm.controls.fromWarehouseId.value;
        if (currentSource) {
          this.onSourceWarehouseChange(currentSource);
        }
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to load warehouses');
      },
    });
  }

  loadTransfers(): void {
    this.loading = true;
    this.error = '';
    this.transferService.list(this.statusFilter).subscribe({
      next: (data) => {
        this.transfers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to load transfers');
        this.loading = false;
      },
    });
  }

  onFilterChange(value: string): void {
    this.statusFilter = value as TransferStatus | '';
    this.loadTransfers();
  }

  onSourceWarehouseChange(warehouseId: string): void {
    const warehouse = this.warehouses.find((w) => w._id === warehouseId);
    this.availableSkus = warehouse?.items || [];
    this.transferForm.patchValue({ sku: '', name: '' });
  }

  onSkuChange(sku: string): void {
    const item = this.availableSkus.find((s) => s.sku === sku);
    if (item) {
      this.transferForm.patchValue({
        sku: item.sku,
        name: item.name,
        quantity: Math.min(
          Number(this.transferForm.controls.quantity.value) || 1,
          item.quantity || 1
        ),
      });
    }
  }

  warehouseLabel(value: Warehouse | string): string {
    if (typeof value === 'string') {
      return value;
    }
    return `${value.code} — ${value.name}`;
  }

  toggleTimeline(id: string): void {
    this.expandedId = this.expandedId === id ? '' : id;
  }

  createTransfer(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const raw = this.transferForm.getRawValue();
    this.saving = true;
    this.error = '';
    this.success = '';

    this.transferService
      .create({
        fromWarehouseId: raw.fromWarehouseId,
        toWarehouseId: raw.toWarehouseId,
        notes: raw.notes,
        items: [
          {
            sku: raw.sku,
            name: raw.name,
            quantity: Number(raw.quantity),
          },
        ],
      })
      .subscribe({
        next: () => {
          this.success = 'Transfer request created';
          this.transferForm.patchValue({
            sku: '',
            name: '',
            quantity: 1,
            notes: '',
          });
          this.saving = false;
          this.loadTransfers();
        },
        error: (err) => {
          this.error = getErrorMessage(err, 'Failed to create transfer');
          this.saving = false;
        },
      });
  }

  nextActions(status: TransferStatus): TransferStatus[] {
    if (status === 'PENDING') {
      return ['IN_TRANSIT', 'CANCELLED'];
    }
    if (status === 'IN_TRANSIT') {
      return ['COMPLETED', 'CANCELLED'];
    }
    return [];
  }

  actionLabel(status: TransferStatus): string {
    switch (status) {
      case 'IN_TRANSIT':
        return 'Start';
      case 'COMPLETED':
        return 'Complete';
      case 'CANCELLED':
        return 'Cancel';
      default:
        return status;
    }
  }

  updateStatus(transfer: Transfer, status: TransferStatus): void {
    const label = this.actionLabel(status);
    const confirmed = window.confirm(
      `Are you sure you want to ${label.toLowerCase()} this transfer?`
    );
    if (!confirmed) {
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    this.transferService.updateStatus(transfer._id, status).subscribe({
      next: (updated) => {
        this.success = `Transfer marked ${updated.status}`;
        this.saving = false;
        this.loadTransfers();
        this.loadWarehouses();
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Failed to update status');
        this.saving = false;
      },
    });
  }
}
