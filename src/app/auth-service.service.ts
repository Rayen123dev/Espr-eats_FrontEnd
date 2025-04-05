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
  private baseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) { }

  /**
   * Redirige vers le point d'entrée OAuth2 Google du backend
   * Cette URL est configurée dans Spring Security pour déclencher le flux d'authentification
   */
  loginWithGoogle(): void {
    // Utiliser l'URL correcte pour déclencher le flux OAuth2
    window.location.href =` ${this.baseUrl}/oauth2/authorization/google`;
  }

  /**
   * Récupère les informations de l'utilisateur après authentification OAuth2
   * @param email L'email de l'utilisateur obtenu après authentification réussie
   */
  handleOAuth2Success(email: string): Observable<OAuthUser> {
    return this.http.get<OAuthUser>(`${this.baseUrl}/api/auth/oauth2-user`, {
      params: { email }
    }).pipe(
      tap(userData => {
        // Stocker les informations si nécessaire
        if (userData.token) {
          localStorage.setItem('oauth_user', JSON.stringify(userData));
        }
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