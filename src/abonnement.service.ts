// abonnement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './app/login.service';

// Define the Abonnement interface to match the backend entity
export interface Abonnement {
  idAbonnement: number;
  typeAbonnement: string;
  abonnementStatus: string;
  renouvellementAutomatique: boolean;
  dateDebut: string; // LocalDate will be serialized as a string (e.g., "2025-04-01")
  dateFin: string;
  cout: number;
  remainingDays: number;
  confirmationCode: string;
  codeExpiration: string; // LocalDateTime will be serialized as a string (e.g., "2025-04-02T10:00:00")
  isBlocked: boolean;
  isConfirmed: boolean;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AbonnementService {
  private apiUrl = 'http://localhost:8081/api/abonnement';

  constructor(private http: HttpClient) {}

  getSubscriptionTypesAndCosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/types-and-costs`);
  }

  createAbonnement(userId: number, abonnement: any): Observable<Abonnement> {
    return this.http.post<Abonnement>(
      `${this.apiUrl}/add/${userId}`,
      abonnement
    );
  }

  confirmAbonnement(userId: number, confirmationCode: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/confirm/${userId}/${confirmationCode}`,
      null
    );
  }

  getAbonnementById(
    userId: number,
    idAbonnement: number
  ): Observable<Abonnement> {
    return this.http.get<Abonnement>(
      `${this.apiUrl}/get/${userId}/${idAbonnement}`
    );
  }

  deleteAbonnement(userId: number, idAbonnement: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${userId}/${idAbonnement}`);
  }

  updateAbonnement(
    userId: number,
    abonnement: Abonnement
  ): Observable<Abonnement> {
    return this.http.put<Abonnement>(
      `${this.apiUrl}/update/${userId}`,
      abonnement
    );
  }
}
