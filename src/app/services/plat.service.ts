import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Plat, CategoriePlat } from '../../core/models/plat.model';

@Injectable({
  providedIn: 'root'
})
export class PlatService {
  private apiUrl = 'http://localhost:8081/api/plats';


  constructor(private http: HttpClient) {}

  getAllPlats(): Observable<Plat[]> {
    const token = localStorage.getItem('token');
    return this.http.get<Plat[]>(this.apiUrl,{
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          })
        });
  }

  getPlatsByCategorie(categorie: CategoriePlat): Observable<Plat[]> {
    const token = localStorage.getItem('token');
    return this.http.get<Plat[]>(`${this.apiUrl}/categorie/${categorie}`,{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
  }

  addPlat(plat: Plat, userId: number): Observable<Plat> {
    const token = localStorage.getItem('token');
    return this.http.post<Plat>(`${this.apiUrl}/addplat?userId=${userId}`, plat,{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
    
  }
  addPlatWithImage(formData: FormData, userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/addplatWithImage`, formData, {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`
        })
    });
}

updatePlatWithImage(id: number, userId: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.apiUrl}/${id}/updateWithImage`, formData, {
        headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`
        })
    });
}


  updatePlat(platId: number, userId: number, plat: Plat): Observable<Plat> {
    const token = localStorage.getItem('token');
    return this.http.put<Plat>(`${this.apiUrl}/${platId}?userId=${userId}`, plat,{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });

  }
  

  getPlatById(id: number): Observable<Plat> {
    const token = localStorage.getItem('token');
    return this.http.get<Plat>(`http://localhost:8081/api/plats/${id}`,{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
  }
  


  deletePlat(platId: number, userId: number): Observable<void> {
    const token = localStorage.getItem('token');
    return this.http.delete<void>(`${this.apiUrl}/${platId}?userId=${userId}`,{
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
  }
  // addPlatsToRegime(regimeId: number, platIds: number[], userId: number): Observable<any> {
  //   const token = localStorage.getItem('token');
  //   const url = `${this.apiUrl}/${regimeId}/addPlats?userId=${userId}`;
  //   return this.http.put(url, platIds,{
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json'
  //     })
  //   });
  // }
  // assignPlatsToRegime(regimeId: number, platIds: number[], userId: number): Observable<any> {
  //   const token = localStorage.getItem('token');
  //   const url = `http://localhost:8081/api/regime/addPlats?userId=${userId}`;
  
  //   return this.http.put(url, { regimeId, platIds }, {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json'
  //     })
  //   });
  // }
  getPlatImage(id: number): Observable<string> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/${id}/image`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }),
      responseType: 'text'
    });
  }
  getSuggestions(régime: string): Observable<Plat[]> {
    return this.http.get<Plat[]>(`${this.apiUrl}?régime=${régime}`);
  }
  
}
