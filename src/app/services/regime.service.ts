import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegimeAlimentaire, RegimeAlimentaireType } from '../../core/models/regime.model';
import { Plat } from '../../core/models/plat.model';

@Injectable({
  providedIn: 'root'
})
export class RegimeService {
  private apiUrl = 'http://localhost:8081/api/regimes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Aucun token trouvé dans localStorage');
      throw new Error('No token found in localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllRegimes(): Observable<RegimeAlimentaire[]> {
    return this.http.get<RegimeAlimentaire[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getRegimeByType(type: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${type}`, { headers: this.getHeaders() });
  }

  addRegime(regime: RegimeAlimentaire, userId: number): Observable<RegimeAlimentaire> {
    return this.http.post<RegimeAlimentaire>(`${this.apiUrl}/aadregime?userId=${userId}`, regime, {
      headers: this.getHeaders()
    });
  }

  assignPlatsToRegime(regimeId: number, platIds: number[], userId: number): Observable<{ message: string }> {
    const url = `${this.apiUrl}/regime/addPlats?userId=${userId}`;
    const body = {
      regimeId: regimeId,
      platIds: platIds
    };
    return this.http.put<{ message: string }>(url, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(err => {
        console.error('Erreur HTTP dans assignPlatsToRegime :', err);
        return throwError(() => err);
      })
    );
  }

  updateRegime(regimeId: number, userId: number, regime: RegimeAlimentaire): Observable<RegimeAlimentaire> {
    return this.http.put<RegimeAlimentaire>(`${this.apiUrl}/${regimeId}?userId=${userId}`, regime, {
      headers: this.getHeaders()
    });
  }
  deleteRegime(regimeId: number, userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${regimeId}?userId=${userId}`, { headers });
  }

  // Nouvelle méthode pour désassigner un plat d'un régime
  unassignPlatFromRegime(regimeId: number, platId: number, userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(
      `${this.apiUrl}/unassign-plat/${regimeId}/${platId}/${userId}`,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }
    ).pipe(
      catchError(error => {
        console.error('Erreur lors de la désassignation du plat:', error);
        return throwError(() => error);
      })
    );
  }
}