import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {


  constructor(private http: HttpClient) { }  
 apiUrl="http://192.168.1.40:5000"

  
    recommondation(): Observable<Blob> {
      return this.http.get(`${this.apiUrl}/recommandations`, { responseType: 'blob' });
    }
}
