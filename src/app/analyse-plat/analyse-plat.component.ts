import { Component, OnInit } from '@angular/core';
import { AnalysePlatService } from '../services/analyse-plat.service';
import { ProfilNutritionnelService } from '../services/profil-nutritionnel.service';

@Component({
  selector: 'app-analyse-plat',
  templateUrl: './analyse-plat.component.html',
  styleUrls: ['./analyse-plat.component.scss']
})
export class AnalysePlatComponent implements OnInit {
  imageToUpload: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  ingredientsDetectes: string[] = [];
  ingredientsComplets: string[] = [];
  nutritionInfos: any[] = [];
  message: string = '';
  loading = false;
  recommandation: string = '';
  estBonPourRegime: boolean = false;
  conseilAllergie: string = '';
  selectedImage = false;


  besoinCalorique: number = 2000;
  regimeAlimentaire: string = 'NORMAL';
  allergies: string[] = [];

  constructor(
    private analyseService: AnalysePlatService,
    private profilService: ProfilNutritionnelService
  ) {}

  ngOnInit(): void {
    this.chargerProfilUtilisateur();
  }

  chargerProfilUtilisateur() {
    this.profilService.getMyProfil().subscribe({
      next: (profil) => {
        this.besoinCalorique = profil.besoinCalorique || 2000;
        this.regimeAlimentaire = profil.regimeAlimentaire || 'NORMAL';
        this.allergies = profil.allergies?.map((a: string) => a.toLowerCase()) || [];
      },
      error: () => {
        console.warn("Impossible de récupérer le profil nutritionnel.");
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.imageToUpload = event.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.selectedImage = true;
      };
      reader.readAsDataURL(this.imageToUpload);
    }
  }

  onFileSelected(event: any) {
    this.imageToUpload = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.selectedImage = true;
    };
    if (this.imageToUpload) {
      reader.readAsDataURL(this.imageToUpload);
    }
  }

  analyserImage() {
    if (!this.imageToUpload) return;

    this.loading = true;
    this.message = '';
    this.conseilAllergie = '';
    this.ingredientsDetectes = [];
    this.ingredientsComplets = [];
    this.nutritionInfos = [];
    this.recommandation = '';

    this.analyseService.detecterImage(this.imageToUpload).subscribe({
      next: (data) => {
        this.ingredientsDetectes = data.ingredients;
        this.nutritionInfos = data.nutrition || [];

        const totalCalories = this.nutritionInfos.reduce(
          (acc, item) => acc + (item.calories || 0), 0
        );

        const portionIdeale = this.besoinCalorique * 0.3;
        const tolerance = 0.15;
        const delta = totalCalories - portionIdeale;

        this.recommandation = Math.abs(delta) <= portionIdeale * tolerance
          ? `Ce plat correspond bien à un repas pour votre profil (${totalCalories} kcal pour ~${Math.round(portionIdeale)} kcal attendus).`
          : totalCalories > portionIdeale * (1 + tolerance)
            ? `Ce plat est un peu trop calorique pour un repas (objectif ~${Math.round(portionIdeale)} kcal).`
            : `Ce plat est léger pour un repas complet (objectif ~${Math.round(portionIdeale)} kcal).`;

        this.estBonPourRegime = Math.abs(delta) <= portionIdeale * tolerance;

        if (this.ingredientsDetectes.length > 0) {
          const nomPlat = this.ingredientsDetectes[0];

          this.analyseService.getIngredientsFromGemini(nomPlat).subscribe({
            next: (res) => {
              // Supprime les étoiles et espaces inutiles
              this.ingredientsComplets = res.map(ing =>
                ing.replace(/\*/g, '').trim()
              );

              const allergensTrouves = this.ingredientsComplets.filter(ing =>
                this.allergies.some(all => ing.toLowerCase().includes(all))
              );

              if (allergensTrouves.length > 0) {
                this.message = `⚠️ Attention : Ce plat contient des ingrédients auxquels vous êtes allergique : ${allergensTrouves.join(", ")}`;

                this.analyseService.getConseilsAllergie(nomPlat, allergensTrouves).subscribe({
                  next: (res) => {
                    this.conseilAllergie = res.conseil
                      .replace(/\*/g, '') // supprime les *
                      .trim();
                  },
                  error: () => {
                    this.conseilAllergie = "Conseil non disponible pour cette allergie.";
                  }
                });
              }
            },
            error: () => {
              this.ingredientsComplets = ['Ingrédients non disponibles.'];
            }
          });
        }

        this.loading = false;
      },
      error: (err) => {
        this.message = "Erreur lors de l’analyse.";
        this.loading = false;
        console.error(err);
      }
    });
  }

  formatNumber(value: unknown): number {
    return typeof value === 'number' ? value : parseFloat(value as string);
  }

}
