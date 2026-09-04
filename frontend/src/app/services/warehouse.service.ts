import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Warehouse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly baseUrl = `${environment.apiUrl}/warehouses`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Warehouse[]> {
    return this.http
      .get<ApiResponse<Warehouse[]>>(this.baseUrl)
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

  upsertStock(
    warehouseId: string,
    payload: { sku: string; name: string; quantity: number }
  ): Observable<Warehouse> {
    return this.http
      .post<ApiResponse<Warehouse>>(`${this.baseUrl}/${warehouseId}/stock`, payload)
      .pipe(map((res) => res.data));
  }
}
