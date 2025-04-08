import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfilNutritionnelService } from 'src/app/services/profil-nutritionnel.service';

@Component({
  selector: 'app-profil-nutritionnel',
  templateUrl: './profil-nutritionnel.component.html',
  styleUrls: ['./profil-nutritionnel.component.css']
})
export class ProfilNutritionnelComponent implements OnInit {
  loading = true;

  constructor(
    private profilService: ProfilNutritionnelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profilService.getMyProfil().subscribe({
      next: () => {
        // ✅ Si l’utilisateur a un profil, redirige vers la page des détails
        this.router.navigate(['/profil-nutritionnel/mon-profil']);
      },
      error: (err) => {
        if (err.status === 404) {
          // ✅ Pas de profil => on affiche cette page d’accueil
          this.loading = false;
        }
      }
    });
  }

  goToCreation(): void {
    this.router.navigate(['/profil-nutritionnel/create']);
  }
}
