import { Component, OnInit } from '@angular/core';
import { Consultation, ConsultationService } from 'src/app/services/consultation.service';
import { LoginService } from 'src/app/login.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Router } from '@angular/router'; // ⬅️ Ajoute ceci en haut


@Component({
  selector: 'app-consultations-medecin',
  templateUrl: './consultations-medecin.component.html',
  styleUrls: ['./consultations-medecin.component.css']
})
export class ConsultationsMedecinComponent implements OnInit {
  consultations: Consultation[] = [];
  filteredConsultations: Consultation[] = [];
  pagedConsultations: Consultation[] = [];

  filter = { nom: '', statut: '' };
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: [],
    height: 450,
    eventColor: '#1d4ed8',
    eventDisplay: 'block'
  };

  constructor(
    private consultationService: ConsultationService,
    private loginService: LoginService,
    private router: Router // ⬅️ ajoute ici aussi
  ) {}


  ngOnInit(): void {
    const medecinId = this.loginService.getUserIdFromToken();
    if (medecinId) {
      this.consultationService.getConsultationsByMedecin(medecinId).subscribe({
        next: (data) => {
          this.consultations = [...data];
          this.filteredConsultations = [...this.consultations];
          this.applyFilters();
          this.loadCalendarEvents();
        },
        error: (err) => {
          console.error('Erreur récupération consultations du médecin', err);
        }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.consultations];

    if (this.filter.nom.trim()) {
      filtered = filtered.filter(c =>
        c.etudiant.nom.toLowerCase().includes(this.filter.nom.toLowerCase())
      );
    }

    if (this.filter.statut) {
      filtered = filtered.filter(c => c.statut === this.filter.statut);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.dateConsultation).getTime();
      const dateB = new Date(b.dateConsultation).getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.filteredConsultations = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updatePagedConsultations();
  }

  updatePagedConsultations(): void {
    this.pagedConsultations = this.filteredConsultations.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedConsultations();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedConsultations();
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return '🕒 En attente';
      case 'TERMINEE': return '✅ Terminée';
      case 'ANNULEE': return '❌ Annulée';
      default: return statut;
    }
  }

  loadCalendarEvents(): void {
    this.calendarOptions.events = this.consultations.map(c => ({
      title: `${c.typeConsultation} - ${c.etudiant.nom}`,
      start: c.dateConsultation,
      color: this.getColorByStatut(c.statut),
      id: c.id.toString() // nécessaire pour rediriger avec l'id
    }));

    this.calendarOptions.eventClick = (arg) => {
      const consultationId = arg.event.id;
      if (consultationId) {
        this.router.navigate(['/medecin/consultation', consultationId]);
      }
    };
  }


  getColorByStatut(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return '#ffc107';
      case 'TERMINEE': return '#28a745';
      case 'ANNULEE': return '#dc3545';
      default: return '#007bff';
    }
  }




}
