import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
        });
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
  })
);

  }
  rejectMenus(userId: number, menuIds: number[], rejectionReason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reject?doctorId=${userId}`, { menuIds, rejectionReason });
  }
  generateMenus(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/generate?userId=${userId}`, {},{
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
  return this.http.post(`http://localhost:8081/api/menus/validate?doctorId=${doctorId}`, menuIds, { ...options, headers });
}

  regenerateMenus(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/regenerate?userId=${userId}`, {},{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
  }
}