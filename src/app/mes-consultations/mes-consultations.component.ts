import { Component, OnInit } from '@angular/core';
import { ConsultationService, Consultation } from 'src/app/services/consultation.service';

@Component({
  selector: 'app-mes-consultations',
  templateUrl: './mes-consultations.component.html',
  styleUrls: ['./mes-consultations.component.scss']
})
export class MesConsultationsComponent implements OnInit {
  consultations: Consultation[] = [];
  filteredConsultations: Consultation[] = [];
  recommandations: { [key: number]: string } = {};

  types: string[] = ['TOUS', 'GENERALE', 'NUTRITIONNELLE', 'PSYCHOLOGIQUE', 'SUIVI_MEDICAL', 'PREVENTION', 'ACTIVITE_PHYSIQUE'];

  selectedType = 'TOUS';
  sortBy: 'recent' | 'oldest' = 'recent';

  statuts: string[] = ['TOUS', 'EN_ATTENTE', 'TERMINEE', 'ANNULEE'];
  selectedStatut = 'TOUS';

  currentPage = 1;
  pageSize = 4;
  loading = false;
  errorMessage = '';
  successMessage = '';
  successSuccess = true;

  constructor(private consultationService: ConsultationService) {}

  ngOnInit(): void {
    this.fetchConsultations();
  }

  fetchConsultations(): void {
    this.loading = true;
    this.consultationService.getMesConsultations().subscribe({
      next: data => {
        this.consultations = data;
        this.applyFilters();
        this.fetchRecommandations();
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Erreur lors du chargement des consultations.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  fetchRecommandations(): void {
    this.consultations
      .filter(c => c.statut === 'TERMINEE')
      .forEach(c => {
        this.consultationService.getRecommandationByConsultationId(c.id).subscribe({
          next: recommandations => {
            if (recommandations.length > 0) {
              this.recommandations[c.id] = recommandations[0].descriptionRecommandation;
            }
          },
          error: err => {
            console.warn(`Pas de recommandation pour la consultation ${c.id}`, err);
          }
        });
      });
  }

  formatStatut(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return '⏳ En attente';
      case 'TERMINEE': return '✅ Terminée';
      case 'ANNULEE': return '❌ Annulée';
      default: return statut;
    }
  }

  onTypeChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.consultations];

    if (this.selectedType !== 'TOUS') {
      result = result.filter(c => c.typeConsultation === this.selectedType);
    }

    if (this.selectedStatut !== 'TOUS') {
      result = result.filter(c => c.statut === this.selectedStatut);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.dateConsultation).getTime();
      const dateB = new Date(b.dateConsultation).getTime();
      return this.sortBy === 'recent' ? dateA - dateB : dateB - dateA;
    });

    this.filteredConsultations = result;
  }


  get paginatedConsultations(): Consultation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredConsultations.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredConsultations.length / this.pageSize);
  }

  changePage(delta: number): void {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 1 && nextPage <= this.totalPages()) {
      this.currentPage = nextPage;
    }
  }

  annulerConsultation(id: number): void {
    const consultation = this.consultations.find(c => c.id === id);
    if (!consultation) return;

    if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      const updatedConsultation: Consultation = {
        ...consultation,
        statut: 'ANNULEE'
      };

      this.consultationService.updateConsultation(id, updatedConsultation).subscribe({
        next: () => {
          this.successSuccess = true;
          this.successMessage = 'Consultation annulée avec succès.';
          this.fetchConsultations(); // refresh
        },
        error: () => {
          this.successSuccess = false;
          this.successMessage = "Erreur lors de l'annulation.";
        }
      });
    }
  }

  onStatutChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }


}
