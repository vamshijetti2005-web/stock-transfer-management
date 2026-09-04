import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  PaginatedResult,
  Transfer,
  TransferStatus,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly baseUrl = `${environment.apiUrl}/transfers`;

  constructor(private readonly http: HttpClient) {}

  list(
    status?: TransferStatus | '',
    page = 1,
    limit = 5,
    fromWarehouseId = '',
    toWarehouseId = ''
  ): Observable<PaginatedResult<Transfer>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (status) {
      params = params.set('status', status);
    }
    if (fromWarehouseId) {
      params = params.set('fromWarehouseId', fromWarehouseId);
    }
    if (toWarehouseId) {
      params = params.set('toWarehouseId', toWarehouseId);
    }

    return this.http.get<ApiResponse<Transfer[]>>(this.baseUrl, { params }).pipe(
      map((res) => ({
        items: res.data,
        meta: res.meta || {
          page,
          limit,
          total: res.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }))
    );
  }

  getById(id: string): Observable<Transfer> {
    return this.http
      .get<ApiResponse<Transfer>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: Array<{ sku: string; name: string; quantity: number }>;
    notes?: string;
  }): Observable<Transfer> {
    return this.http
      .post<ApiResponse<Transfer>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  updateStatus(id: string, status: TransferStatus): Observable<Transfer> {
    return this.http
      .patch<ApiResponse<Transfer>>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
