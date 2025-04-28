import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface JobOffer {
  jobOfferId?: number;
  title: string;
  jobDescription: string;
  date: Date;
  skills: string;
  image?: string; // ➡️ keep this for the image path
  jobType?: string;
  location?: string;
  salary?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8081/api/offer';
  private savedJobsKey = 'savedJobs';

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

  // Save job methods
  saveJob(jobOffer: JobOffer): void {
    if (!jobOffer.jobOfferId) return;

    const savedJobs = this.getSavedJobs();
    if (!savedJobs.includes(jobOffer.jobOfferId)) {
      savedJobs.push(jobOffer.jobOfferId);
      localStorage.setItem(this.savedJobsKey, JSON.stringify(savedJobs));
    }
  }

  unsaveJob(jobOfferId: number): void {
    const savedJobs = this.getSavedJobs();
    const index = savedJobs.indexOf(jobOfferId);
    if (index !== -1) {
      savedJobs.splice(index, 1);
      localStorage.setItem(this.savedJobsKey, JSON.stringify(savedJobs));
    }
  }

  getSavedJobs(): number[] {
    const savedJobs = localStorage.getItem(this.savedJobsKey);
    return savedJobs ? JSON.parse(savedJobs) : [];
  }

  isJobSaved(jobOfferId: number): boolean {
    return this.getSavedJobs().includes(jobOfferId);
  }

  getSavedJobOffers(): Observable<JobOffer[]> {
    const savedJobIds = this.getSavedJobs();
    if (savedJobIds.length === 0) {
      return of([]);
    }

    return this.http.get<JobOffer[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() })
      .pipe(
        map((offers: JobOffer[]) => offers.filter(offer => offer.jobOfferId && savedJobIds.includes(offer.jobOfferId)))
      );
  }
}
