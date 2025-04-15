import { Injectable } from '@angular/core';
import { User, Role } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // In a real application, this might come from local storage or a login process
    // This is a placeholder implementation
    
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
  getUserRole(): string {
    return this.currentUser ? this.currentUser.role : '';
  }


  login(username: string, password: string): boolean {
    // In a real application, this would involve calling a backend service
    // This is a simple mock implementation
    if (username === 'staff' && password === 'password') {
      this.currentUser = {
        id: 1,
        username: 'staff',
        role: Role.Staff
      };
      return true;
    }
    if (username === 'doctor' && password === 'password') {
      this.currentUser = {
        id: 2,
        username: 'doctor',
        role: Role.Medecin
      };
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
  }
}