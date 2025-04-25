import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8081/post/search';

  constructor(private http: HttpClient) { }

  searchPosts(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?keyword=${encodeURIComponent(keyword)}`);
  }
}