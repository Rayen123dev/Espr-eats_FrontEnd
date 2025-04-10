import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Menu } from '../../core/models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8081/api/menus';

  constructor(private http: HttpClient) {}

  getAllMenus(userId: number): Observable<Menu[]> {
    const token = localStorage.getItem('token');
    return this.http.get<Menu[]>(`${this.apiUrl}/all?userId=${userId}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(this.handleError) // Référence à handleError
    );
  }

  getValidatedMenus(): Observable<Menu[]> {
    const token = localStorage.getItem('token');
    return this.http.get(this.apiUrl, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
      responseType: 'text'
    }).pipe(
      tap(response => console.log('Réponse JSON brute:', response)),
      map(response => {
        try {
          return JSON.parse(response);
        } catch (e) {
          console.error('Erreur de parsing JSON:', e);
          return [];
        }
      }),
      catchError(this.handleError) // Référence à handleError
    );
  }

  rejectMenus(userId: number, menuIds: number[], rejectionReason: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/reject?doctorId=${userId}`, { menuIds, rejectionReason }, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(this.handleError) // Référence à handleError
    );
  }

 generateMenus(userId: number): Observable<any> {
  const token = localStorage.getItem('token');
  return this.http.post<any>(`${this.apiUrl}/generate?userId=${userId}`, {}, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  });
}

  validateMenus(doctorId: number, menuIds: number[], options?: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`http://localhost:8081/api/menus/validate?doctorId=${doctorId}`, menuIds, { ...options, headers }).pipe(
      catchError(this.handleError) // Référence à handleError
    );
  }

  regenerateMenus(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/regenerate?userId=${userId}`, {}, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(this.handleError) // Référence à handleError
    );
  }

  // Méthode handleError pour gérer les erreurs HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client (ex. problème de réseau)
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur (ex. 500)
      errorMessage = `Erreur serveur: Code ${error.status}, Message: ${error.message}`;
      console.error('Détails de l’erreur:', error.error);
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}