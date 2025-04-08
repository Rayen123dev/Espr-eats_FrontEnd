import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserLite {
  id?: number;       // utilisé côté Angular
  idUser?: number;   // utilisé côté backend Java
  nom: string;
}

export interface Consultation {
  id: number;
  dateConsultation: string;
  statut: 'EN_ATTENTE' | 'ANNULEE' | 'TERMINEE';
  typeConsultation: string;
  message?: string;
  etudiant: UserLite;
  medecin: UserLite;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private baseUrl = 'http://localhost:8081/api/consultations';
  private profilUrl = 'http://localhost:8081/api/profil';
  private recommandationUrl = 'http://localhost:8081/api/recommandations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  //  CONSULTATIONS

  createConsultation(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getConsultationById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateConsultation(id: number, consultation: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.baseUrl}/${id}`, consultation, {
      headers: this.getAuthHeaders()
    });
  }

  getConsultationsByMedecin(medecinId: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.baseUrl}/medecin/${medecinId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getConsultationsByEtudiant(userId: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.baseUrl}/etudiant/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getMesConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.baseUrl}/mes-consultations`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  prendreConsultation(data: any): Observable<any> {
    return this.createConsultation(data);
  }

  //  PROFIL NUTRITIONNEL

  getProfilByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.profilUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  //  RECOMMANDATION

  addRecommandation(recommandation: {
    consultation: { id: number },
    medecin: { id_user: number },
    descriptionRecommandation: string
  }): Observable<any> {
    return this.http.post(this.recommandationUrl, recommandation, {
      headers: this.getAuthHeaders()
    });
  }

  getRecommandationByConsultationId(consultationId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/api/recommandations/consultation/${consultationId}`, {
      headers: this.getAuthHeaders()
    });
  }

  

}
