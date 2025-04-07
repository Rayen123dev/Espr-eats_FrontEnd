// auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const isLoggedIn = this.loginService.isLoggedIn();
    const expectedRole = route.data['expectedRole'];
    const userRole = this.loginService.getRole();

    if (!isLoggedIn) {
      return this.router.parseUrl('/login');
    }

    if (expectedRole && userRole !== expectedRole) {
      return this.router.parseUrl('/unauthorized'); // à créer si besoin
    }

    return true;
  }
}
