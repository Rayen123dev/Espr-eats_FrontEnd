import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProduitHistorique } from '../models/ProduitHistorique ';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitHistoriqueService {
  private apiUrl = 'http://localhost:8081/historique';
  constructor(private http: HttpClient) { }


  getAllHistorique(): Observable<ProduitHistorique[]> {
    return this.http.get<ProduitHistorique[]>(`${this.apiUrl}/retrieve-all-historiques`);
  }

  
  getAIStockSummary(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/retrieve-ai-summary`);
  }
}
