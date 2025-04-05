// abonnement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './app/login.service';

export interface SubscriptionReport {
  activeSubscriptions: number;
  pendingSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  monthlyGrowth: { [key: string]: number }; // Map of month names to subscription counts
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface Transaction {
  idTransaction: number;
  abonnement: Abonnement; // Reference to the Abonnement entity
  montant: number;
  status: TransactionStatus;
  dateTransaction: string; // LocalDateTime serialized as string (e.g., "2025-04-02 10:00:00")
  referencePaiement: string;
  details: string;
}

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
  stripeSessionId: string;
}

export interface CreateAbonnementResponse {
  stripeResponse: {
    paymentId: string;
    status: string;
    message: string; // This is the Stripe Checkout URL
  };
  abonnement: Abonnement;
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

  createAbonnement(
    userId: number,
    abonnement: any
  ): Observable<CreateAbonnementResponse> {
    return this.http.post<CreateAbonnementResponse>(
      `${this.apiUrl}/add/${userId}`,
      abonnement
    );
  }

  confirmAbonnement(
    userId: number,
    confirmationCode: string
  ): Observable<Abonnement> {
    return this.http.put<Abonnement>(
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

  getRecommendedSubscriptionType(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/recommended-type`, {
      responseType: 'text' as 'json',
    });
  }

  getTransactionsByAbonnementId(
    userId: number,
    abonnementId: number
  ): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `http://localhost:8081/api/transaction/allAbonnement/${userId}/${abonnementId}`
    );
  }

  getSubscriptionReport(): Observable<SubscriptionReport> {
    return this.http.get<SubscriptionReport>(`${this.apiUrl}/report`);
  }
}
