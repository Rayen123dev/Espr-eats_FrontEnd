import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConsultationService, Consultation } from 'src/app/services/consultation.service';

@Component({
  selector: 'app-consultation-detail',
  templateUrl: './consultation-detail.component.html',
  styleUrls: ['./consultation-detail.component.scss']
})
export class ConsultationDetailComponent implements OnInit {
  consultation?: Consultation;
  profilNutritionnel: any;
  form: FormGroup;
  showSuccessMessage = false;
  existingRecommandation?: string;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      recommandation: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.consultationService.getConsultationById(id).subscribe({
      next: (data) => {
        this.consultation = data;

        const etudiantId = data.etudiant?.idUser ?? data.etudiant?.id;
        if (etudiantId) this.loadProfilNutritionnel(etudiantId);

        this.consultationService.getRecommandationByConsultationId(id).subscribe({
          next: (recs) => {
            if (recs.length > 0) {
              this.existingRecommandation = recs[0].descriptionRecommandation;
              this.form.patchValue({ recommandation: this.existingRecommandation });
            }
          }
        });
      },
      error: (err) => {
        console.error('Erreur récupération consultation', err);
      }
    });
  }

  loadProfilNutritionnel(userId: number): void {
    this.consultationService.getProfilByUserId(userId).subscribe({
      next: (profil) => {
        this.profilNutritionnel = profil;
      },
      error: (err) => {
        console.warn('Profil non trouvé', err);
      }
    });
  }

  submit(): void {
    if (!this.consultation) return;

    const updatedConsultation: Consultation = {
      ...this.consultation,
      statut: 'TERMINEE'
    };

    const medecinId = this.consultation.medecin.idUser ?? this.consultation.medecin.id;

    if (!medecinId) {
      alert("❌ Impossible d'enregistrer la recommandation.");
      return;
    }

    this.consultationService.updateConsultation(this.consultation.id, updatedConsultation).subscribe({
      next: () => {
        const recommandation = {
          consultation: { id: this.consultation!.id },
          medecin: { id_user: medecinId },
          descriptionRecommandation: this.form.value.recommandation
        };

        this.consultationService.addRecommandation(recommandation).subscribe({
          next: () => {
            this.showSuccessMessage = true;
            setTimeout(() => this.router.navigate(['/medecin/consultations']), 2000);
          },
          error: (err) => {
            alert("❌ Erreur lors de l'enregistrement.");
          }
        });
      }
    });
  }

  formatBloodGroup(code: string): string {
    if (!code) return '';
    return code
      .replace('_POSITIF', '+')
      .replace('_NEGATIF', '-')
      .replace('_', '');
  }

}
