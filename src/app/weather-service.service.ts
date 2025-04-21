import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WeatherServiceService {
  private apiKey = '8191c95764834d7188c142712252104';
  private baseUrl = 'https://api.weatherapi.com/v1';

  constructor(private http: HttpClient) {}

  getCurrentWeather(location: string) {
    return this.http.get(`${this.baseUrl}/current.json?key=${this.apiKey}&q=${location}`);
  }
}
