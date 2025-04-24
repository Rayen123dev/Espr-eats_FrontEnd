import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConsultationService } from 'src/app/services/consultation.service';

@Component({
  selector: 'app-consulter-medecin',
  templateUrl: './consulter-medecin.component.html',
  styleUrls: ['./consulter-medecin.component.scss']
})
export class ConsulterMedecinComponent implements OnInit {
  form!: FormGroup;
  successMessage = '';
  successSuccess = true;
  minDate = '';
  heuresDisponibles: string[] = [];
  toutesPrises = false;
  motifIndisponibilite = '';
  showSuccess = false;

  constructor(
    private fb: FormBuilder,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.form = this.fb.group({
      typeConsultation: ['GENERALE', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      dateJour: ['', Validators.required],
      heure: ['', Validators.required]
    });

    this.form.get('dateJour')?.valueChanges.subscribe(date => {
      if (date) this.loadHeuresDisponibles(date);
    });
  }

  loadHeuresDisponibles(date: string): void {
    this.heuresDisponibles = [];
    this.toutesPrises = false;
    this.motifIndisponibilite = '';

    const jour = new Date(date).getDay();
    if (jour === 0 || jour === 6) {
      this.toutesPrises = true;
      this.motifIndisponibilite = '❌ Le médecin n’est pas disponible le week-end.';
      return;
    }

    this.consultationService.getAllConsultations().subscribe(consultations => {
      const prises = consultations
        .filter(c => c.dateConsultation.startsWith(date))
        .map(c => new Date(c.dateConsultation).toTimeString().slice(0, 5));

      for (let h = 9; h <= 16; h++) {
        const heureStr = `${h.toString().padStart(2, '0')}:00`;
        if (!prises.includes(heureStr)) {
          this.heuresDisponibles.push(heureStr);
        }
      }

      if (this.heuresDisponibles.length === 0) {
        this.toutesPrises = true;
        this.motifIndisponibilite = '⚠️ Le médecin est complet pour cette journée.';
      }
    });
  }

  prendreConsultation(): void {
    if (this.form.invalid) {
      this.successSuccess = false;
      this.successMessage = '⚠️ Veuillez remplir correctement tous les champs du formulaire.';
      this.autoCloseToast();
      return;
    }

    const { dateJour, heure, typeConsultation, message } = this.form.value;
    const payload = {
      typeConsultation,
      message,
      dateConsultation: `${dateJour}T${heure}:00`
    };

    this.consultationService.createConsultation(payload).subscribe({
      next: () => {
        this.successSuccess = true;
        this.successMessage = 'Votre demande a été envoyée avec succès ! Un médecin vous contactera prochainement.';
        this.form.reset({ typeConsultation: 'GENERALE' });
        this.heuresDisponibles = [];
        this.autoCloseToast();
      },
      error: () => {
        this.successSuccess = false;
        this.successMessage = '❌ Une erreur est survenue. Veuillez réessayer plus tard.';
        this.autoCloseToast();
      }
    });
  }

  private autoCloseToast(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }
}
