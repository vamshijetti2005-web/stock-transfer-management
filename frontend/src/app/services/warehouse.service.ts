import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  PaginatedResult,
  Warehouse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly baseUrl = `${environment.apiUrl}/warehouses`;

  constructor(private readonly http: HttpClient) {}

  list(page = 1, limit = 5, location = ''): Observable<PaginatedResult<Warehouse>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (location.trim()) {
      params = params.set('location', location.trim());
    }

    return this.http.get<ApiResponse<Warehouse[]>>(this.baseUrl, { params }).pipe(
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

  listOptions(): Observable<Warehouse[]> {
    return this.http
      .get<ApiResponse<Warehouse[]>>(`${this.baseUrl}/options/all`)
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<Warehouse> {
    return this.http
      .get<ApiResponse<Warehouse>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: {
    name: string;
    code: string;
    location?: string;
  }): Observable<Warehouse> {
    return this.http
      .post<ApiResponse<Warehouse>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(
    id: string,
    payload: { name: string; code: string; location?: string }
  ): Observable<Warehouse> {
    return this.http
      .put<ApiResponse<Warehouse>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: string): Observable<{ id: string }> {
    return this.http
      .delete<ApiResponse<{ id: string }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  upsertStock(
    warehouseId: string,
    payload: { sku: string; name: string; quantity: number }
  ): Observable<Warehouse> {
    return this.http
      .post<ApiResponse<Warehouse>>(`${this.baseUrl}/${warehouseId}/stock`, payload)
      .pipe(map((res) => res.data));
  }

  deleteStock(warehouseId: string, sku: string): Observable<Warehouse> {
    return this.http
      .delete<ApiResponse<Warehouse>>(
        `${this.baseUrl}/${warehouseId}/stock/${encodeURIComponent(sku)}`
      )
      .pipe(map((res) => res.data));
  }
}
