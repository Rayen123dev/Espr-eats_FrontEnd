import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnalysePlatService {
  private apiUrl = 'http://localhost:8081/api/image-analysis'; // Spring Boot
  private flaskUrl = 'http://172.20.10.12:5002'; // Flask

  constructor(private http: HttpClient) {}

  detecterImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<any>(`${this.apiUrl}/detect-flask`, formData);
  }

  getIngredientsFromGemini(nomPlat: string) {
    return this.http.post<string[]>(`${this.flaskUrl}/api/ingredients-gemini`, {
      plat: nomPlat
    });
  }

  getConseilsAllergie(plat: string, allergenes: string[]) {
    return this.http.post<{ conseil: string }>('http://172.20.10.12:5002/api/conseils-allergie', {
      plat,
      allergenes
    });
  }

}
