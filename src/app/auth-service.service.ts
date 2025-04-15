import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface OAuthUser {
  id?: number;
  email: string;
  name?: string;
  token?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // Adjust this URL as needed

  storeAuthToken(token: string): void {
    // Store the OAuth2 token in localStorage or sessionStorage
    localStorage.setItem('authToken', token);
  }

  getUserProfile(token: string): Observable<any> {
    // Make a request to your backend or OAuth provider to get user info
    return this.http.get(`${this.apiUrl}/user-profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  private baseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) { }
  

  /**
   * Redirige vers le point d'entrée OAuth2 Google du backend
   * Cette URL est configurée dans Spring Security pour déclencher le flux d'authentification
   */
  loginWithGoogle(): void {
    // Utiliser l'URL correcte pour déclencher le flux OAuth2
    window.location.href = `${this.baseUrl}/oauth2/authorization/google`;
  }

  /**
   * Récupère les informations de l'utilisateur après authentification OAuth2
   * @param email L'email de l'utilisateur obtenu après authentification réussie
   */
  handleOAuth2Success(token: string): Observable<OAuthUser> {
    // Store token first
    localStorage.setItem('jwt_token', token);
    
    // Get user details with the token
    return this.http.get<OAuthUser>(`${this.baseUrl}/api/auth/user-info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(userData => {
        localStorage.setItem('oauth_user', JSON.stringify(userData));
      })
    );
  }

  /**
   * Vérifie si l'utilisateur est connecté via OAuth2
   */
  isOAuthAuthenticated(): boolean {
    const userData = localStorage.getItem('oauth_user');
    return !!userData;
  }

  /**
   * Déconnecte l'utilisateur OAuth2
   */
  logoutOAuth(): void {
    localStorage.removeItem('oauth_user');
  }

  
}