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

  constructor(private fb: FormBuilder, private consultationService: ConsultationService) { }

  ngOnInit(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString().split('T')[0];

    this.form = this.fb.group({
      typeConsultation: ['GENERALE', Validators.required],
      message: ['', Validators.required],
      dateJour: ['', Validators.required],
      heure: ['', Validators.required]
    });

    this.form.get('dateJour')?.valueChanges.subscribe(date => {
      this.loadHeuresDisponibles(date);
    });
  }

  loadHeuresDisponibles(date: string): void {
    this.heuresDisponibles = [];
    this.toutesPrises = false;
    this.motifIndisponibilite = '';

    const selected = new Date(date);
    const jour = selected.getDay();

    if (jour === 0 || jour === 6) {
      this.toutesPrises = true;
      this.motifIndisponibilite = '❌ Le médecin n’est pas disponible le week-end.';
      return;
    }

    this.consultationService.getAllConsultations().subscribe((consultations) => {
      const prises = consultations
        .filter(c => c.dateConsultation.startsWith(date))
        .map(c => new Date(c.dateConsultation).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }));

      for (let h = 9; h <= 16; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`;
        if (!prises.includes(label)) {
          this.heuresDisponibles.push(label);
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
      this.successMessage = 'Veuillez remplir tous les champs.';
      this.successSuccess = false;
      return;
    }

    const date = this.form.value.dateJour;
    const hour = this.form.value.heure;
    const datetimeLocal = `${date}T${hour}:00`;

    const payload = {
      typeConsultation: this.form.value.typeConsultation,
      message: this.form.value.message,
      dateConsultation: datetimeLocal
    };

    this.consultationService.createConsultation(payload).subscribe({
      next: () => {
        this.successSuccess = true;
        this.successMessage = 'Demande envoyée avec succès.';
        this.form.reset({ typeConsultation: 'GENERALE' });
        this.heuresDisponibles = [];
      },
      error: () => {
        this.successSuccess = false;
        this.successMessage = 'Une erreur est survenue.';
      }
    });
  }
}
