import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Transfer, TransferStatus } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly baseUrl = `${environment.apiUrl}/transfers`;

  constructor(private readonly http: HttpClient) {}

  list(status?: TransferStatus | ''): Observable<Transfer[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<ApiResponse<Transfer[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
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
