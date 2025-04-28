import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobOffer {
  jobOfferId?: number;
  title: string;
  jobDescription: string;
  date: Date;
  skills: string;
  image?: string; // ➡️ keep this for the image path
}

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8081/api/offer';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getAllOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  getOfferById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // 🛠 Correct create with image (FormData)
  createOfferWithImage(formData: FormData): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.apiUrl}/add`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // 🛠 Correct update with image (FormData)
  updateOfferWithImage(id: number, formData: FormData): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
