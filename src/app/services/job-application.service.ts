import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private baseUrl = 'http://localhost:8081/api/application';

  constructor(private http: HttpClient) {}

  // ✅ Ajoute le token si disponible
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // ✅ Soumettre une application (motivation + CV)
  submitApplication(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Récupérer toutes les candidatures
  getAllApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  processCV(applicationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/process-cv/${applicationId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json' // 👈 ADD THIS
    });
  }
  
}
