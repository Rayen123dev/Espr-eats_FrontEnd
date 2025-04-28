import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/Produit.model';
import { ToastService } from './toast.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
 
  private baseUrl = 'http://localhost:8081/produit/alerts';  
  
  constructor(private http: HttpClient,private toastService: ToastService) {}

  /* getLowStockAlerts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/low-stock`);
  } */
    getLowStockAlerts(): Observable<Produit[]> {
      return this.http.get<Produit[]>(`${this.baseUrl}/low-stock`).pipe(
        tap((alerts) => {
          if (alerts.length > 0) {
            this.toastService.showToast(`${alerts.length} low stock alerts fetched!`);
          }
        })
      );
    }

  getExpiryAlerts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/expiry`);
  }

  /* getAllAlerts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/all`);
  } */
    getAllAlerts(): Observable<Produit[]> {
      return this.http.get<Produit[]>(`${this.baseUrl}/all`).pipe(
        // Trigger toast notification when all alerts are fetched
        tap((alerts) => {
          if (alerts.length > 0) {
            this.toastService.showToast(`${alerts.length} alerts fetched!`);
          }
        })
      );
    }
  }
