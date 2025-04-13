import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  AbonnementService,
  SubscriptionReport,
  Abonnement,
  TypeAbonnement,
  AbonnementStatus,
  Discount,
} from '../../abonnement.service';
import { ChartOptions, ChartType } from 'chart.js';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

@Component({
  selector: 'app-abonnement-report',
  templateUrl: './abonnement-report.component.html',
  styleUrls: ['./abonnement-report.component.css'],
})
export class AbonnementReportComponent implements OnInit {
  report: SubscriptionReport | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Table data with pagination
  abonnements: Abonnement[] = [];
  isLoadingTable: boolean = false;
  tableErrorMessage: string = '';
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  // Toggle action states
  toggleErrorMessage: string = '';
  toggleSuccessMessage: string = '';

  // Notification state for blocked subscriptions
  showBlockedNotification: boolean = false;

  // Dropdown options for filtering
  types: string[] = Object.values(TypeAbonnement);
  statuses: string[] = Object.values(AbonnementStatus);
  selectedType: string = '';
  selectedStatus: string = '';

  // Discount form
  discountForm: FormGroup;
  showDiscountForm: boolean = false;
  discountSuccessMessage: string = '';
  discountErrorMessage: string = '';

  // Custom toast properties
  showToast: boolean = false;
  toastMessage: string = '';
  toastTitle: string = 'Success';

  // Line Chart for Monthly Growth
  lineChartData: {
    labels: string[];
    datasets: { data: number[]; label: string; [key: string]: any }[];
  } = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Nouveaux Abonnements',
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Croissance Mensuelle des Abonnements' },
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Mois' } },
      y: {
        display: true,
        title: { display: true, text: "Nombre d'Abonnements" },
        beginAtZero: true,
      },
    },
  };
  lineChartType: ChartType = 'line';
  lineChartLegend = true;

  // Pie Chart for Subscription Status Distribution
  pieChartData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      hoverBackgroundColor: string[];
    }[];
  } = {
    labels: ['Actifs', 'En Attente', 'Expirés', 'Bloqués'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
        hoverBackgroundColor: ['#218838', '#e0a800', '#c82333', '#5a6268'],
      },
    ],
  };
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: "Répartition des Statuts d'Abonnement" },
    },
  };
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;

  constructor(
    private abonnementService: AbonnementService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    // Custom validator for date range
    const dateRangeValidator: ValidatorFn = (
      formGroup: AbstractControl
    ): ValidationErrors | null => {
      const startDate = formGroup.get('startDate')?.value;
      const endDate = formGroup.get('endDate')?.value;
      if (!startDate || !endDate) {
        return null; // Let required validator handle empty fields
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      return end >= start ? null : { dateRange: true };
    };

    this.discountForm = this.fb.group(
      {
        percentage: [
          '',
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        type: ['', Validators.required],
        isActive: [true],
      },
      { validators: dateRangeValidator }
    );
  }

  ngOnInit(): void {
    if (!this.types || this.types.length === 0) {
      console.warn('Types array is empty. Using fallback values.');
      this.types = ['MENSUEL', 'TRIMESTRIEL', 'SEMESTRIEL', 'ANNUEL'];
      this.cdr.detectChanges();
    }

    this.fetchSubscriptionReport();
    this.fetchAbonnements();
  }

  fetchSubscriptionReport(): void {
    this.isLoading = true;
    this.abonnementService.getSubscriptionReport().subscribe({
      next: (report) => {
        this.report = report;
        this.updateCharts();
        this.isLoading = false;
        this.errorMessage = '';

        if (report.blockedSubscriptions > 0) {
          this.showBlockedNotification = true;
          setTimeout(() => {
            this.showBlockedNotification = false;
            this.cdr.detectChanges();
          }, 5000);
        }
      },
      error: (err) => {
        console.error('Error fetching subscription report:', err);
        this.errorMessage =
          'Impossible de récupérer le rapport des abonnements. Veuillez réessayer plus tard.';
        this.isLoading = false;
      },
    });
  }

  updateCharts(): void {
    if (!this.report) {
      console.warn('Cannot update charts: report is null');
      return;
    }

    const report: SubscriptionReport = this.report;

    const monthlyGrowthEntries = Object.keys(report.monthlyGrowth)
      .map((month) => ({ month, count: report.monthlyGrowth[month] }))
      .sort((a, b) => a.month.localeCompare(b.month));
    this.lineChartData.labels = monthlyGrowthEntries.map(
      (entry) => entry.month
    );
    this.lineChartData.datasets[0].data = monthlyGrowthEntries.map(
      (entry) => entry.count
    );

    this.pieChartData.datasets[0].data = [
      report.activeSubscriptions,
      report.pendingSubscriptions,
      report.expiredSubscriptions,
      report.blockedSubscriptions,
    ];
  }

  retryFetchReport(): void {
    this.errorMessage = '';
    this.fetchSubscriptionReport();
  }

  fetchAbonnements(): void {
    this.isLoadingTable = true;
    this.tableErrorMessage = '';
    this.abonnements = [];

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    if (this.selectedType && this.selectedStatus) {
      this.fetchByTypeAndStatus(startIndex, endIndex);
    } else if (this.selectedType) {
      this.abonnementService.getAbonnementsByType(this.selectedType).subscribe({
        next: (abonnements) => {
          this.totalItems = abonnements.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.abonnements = abonnements.slice(startIndex, endIndex);
          this.isLoadingTable = false;
          console.log('Fetched abonnements by type:', this.abonnements);
        },
        error: (err) => {
          console.error('Error fetching abonnements by type:', err);
          this.tableErrorMessage =
            'Erreur lors de la récupération des abonnements par type.';
          this.isLoadingTable = false;
        },
      });
    } else if (this.selectedStatus) {
      this.abonnementService
        .getAbonnementsByStatus(this.selectedStatus)
        .subscribe({
          next: (abonnements) => {
            this.totalItems = abonnements.length;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            this.abonnements = abonnements.slice(startIndex, endIndex);
            this.isLoadingTable = false;
            console.log('Fetched abonnements by status:', this.abonnements);
          },
          error: (err) => {
            console.error('Error fetching abonnements by status:', err);
            this.tableErrorMessage =
              'Erreur lors de la récupération des abonnements par statut.';
            this.isLoadingTable = false;
          },
        });
    } else {
      this.isLoadingTable = false;
      this.totalItems = 0;
      this.totalPages = 1;
    }
  }

  fetchByTypeAndStatus(startIndex: number, endIndex: number): void {
    this.abonnementService.getAbonnementsByType(this.selectedType).subscribe({
      next: (abonnementsByType) => {
        this.abonnementService
          .getAbonnementsByStatus(this.selectedStatus)
          .subscribe({
            next: (abonnementsByStatus) => {
              const filteredAbonnements = abonnementsByType.filter(
                (abonnement) =>
                  abonnementsByStatus.some(
                    (a) => a.idAbonnement === abonnement.idAbonnement
                  )
              );
              this.totalItems = filteredAbonnements.length;
              this.totalPages = Math.ceil(this.totalItems / this.pageSize);
              this.abonnements = filteredAbonnements.slice(
                startIndex,
                endIndex
              );
              this.isLoadingTable = false;
              console.log(
                'Fetched abonnements by type and status:',
                this.abonnements
              );
            },
            error: (err) => {
              console.error('Error fetching abonnements by status:', err);
              this.tableErrorMessage =
                'Erreur lors de la récupération des abonnements par statut.';
              this.isLoadingTable = false;
            },
          });
      },
      error: (err) => {
        console.error('Error fetching abonnements by type:', err);
        this.tableErrorMessage =
          'Erreur lors de la récupération des abonnements par type.';
        this.isLoadingTable = false;
      },
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchAbonnements();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    if (this.currentPage <= this.totalPages) {
      pages.push(this.currentPage);
      if (this.currentPage + 1 <= this.totalPages) {
        pages.push(this.currentPage + 1);
      }
    }
    return pages;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchAbonnements();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.abonnements = [];
    this.totalItems = 0;
    this.currentPage = 1;
    this.totalPages = 1;
    this.tableErrorMessage = '';
    this.cdr.detectChanges();
  }

  toggleBlockedStatus(idAbonnement: number): void {
    console.log('Before toggle - ID:', idAbonnement);
    const abonnement = this.abonnements.find(
      (a) => a.idAbonnement === idAbonnement
    );
    console.log('Current state:', abonnement?.abonnementStatus);

    const index = this.abonnements.findIndex(
      (a) => a.idAbonnement === idAbonnement
    );
    if (index !== -1 && abonnement) {
      const newStatus =
        abonnement.abonnementStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      this.abonnements[index].abonnementStatus = newStatus;
      this.abonnements = [...this.abonnements];
      this.cdr.detectChanges();
      console.log(
        'Local state updated optimistically:',
        this.abonnements[index].abonnementStatus
      );
    }

    this.toggleErrorMessage = '';
    this.toggleSuccessMessage = '';

    this.abonnementService.unblockAbonnement(idAbonnement).subscribe({
      next: (updatedAbonnement) => {
        console.log(
          'API response - New state:',
          updatedAbonnement.abonnementStatus
        );

        if (index !== -1) {
          this.abonnements[index].abonnementStatus =
            updatedAbonnement.abonnementStatus;
          this.abonnements = [...this.abonnements];
          this.cdr.detectChanges();
          console.log(
            'Updated local state from API:',
            this.abonnements[index].abonnementStatus
          );
        }

        this.toggleSuccessMessage = `Abonnement ${
          updatedAbonnement.abonnementStatus === 'SUSPENDED'
            ? 'bloqué'
            : 'débloqué'
        } avec succès !`;
        setTimeout(() => (this.toggleSuccessMessage = ''), 3000);

        if (this.report) {
          this.report.blockedSubscriptions = this.abonnements.filter(
            (a) => a.abonnementStatus === 'SUSPENDED'
          ).length;
          this.updateCharts();
        }
      },
      error: (error) => {
        console.error('API Error:', error);
        if (index !== -1 && abonnement) {
          this.abonnements[index].abonnementStatus =
            abonnement.abonnementStatus;
          this.abonnements = [...this.abonnements];
          this.cdr.detectChanges();
        }
        this.toggleErrorMessage = 'Échec de la mise à jour du statut';
        setTimeout(() => (this.toggleErrorMessage = ''), 3000);
      },
    });
  }

  closeBlockedNotification(): void {
    this.showBlockedNotification = false;
    this.cdr.detectChanges();
  }

  toggleDiscountForm(): void {
    this.showDiscountForm = !this.showDiscountForm;
    if (!this.showDiscountForm) {
      this.discountForm.reset({ isActive: true });
      this.discountSuccessMessage = '';
      this.discountErrorMessage = '';
    }
    this.cdr.detectChanges();
  }

  submitDiscountForm(): void {
    if (this.discountForm.invalid) {
      // Check for date range error specifically
      if (this.discountForm.hasError('dateRange')) {
        this.discountErrorMessage =
          'La date de fin ne peut pas être antérieure à la date de début.';
      } else {
        this.discountErrorMessage =
          'Veuillez remplir tous les champs correctement.';
      }
      this.showToast = true;
      this.toastTitle = 'Danger';
      this.toastMessage = this.discountErrorMessage;
      setTimeout(() => this.closeToast(), 3000);
      return;
    }

    const discount: Discount = {
      percentage: this.discountForm.value.percentage,
      startDate: new Date(this.discountForm.value.startDate).toISOString(),
      endDate: new Date(this.discountForm.value.endDate).toISOString(),
      type: this.discountForm.value.type,
      isActive: this.discountForm.value.isActive,
    };

    const userId = 1;

    this.abonnementService.createDiscount(userId, discount).subscribe({
      next: (createdDiscount) => {
        this.showToast = true;
        this.toastTitle = 'Success';
        this.toastMessage = `Remise de ${createdDiscount.percentage}% pour ${createdDiscount.type} créée avec succès !`;
        setTimeout(() => this.closeToast(), 3000);

        this.discountForm.reset({ isActive: true });
        this.showDiscountForm = false;
        this.discountSuccessMessage = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating discount:', err);
        this.showToast = true;
        this.toastTitle = 'Danger';
        // Check if the error is related to date validation from the backend
        if (err?.error === 'End date cannot be before start date.') {
          this.toastMessage =
            'La date de fin ne peut pas être antérieure à la date de début.';
          this.discountErrorMessage = this.toastMessage;
        } else {
          this.toastMessage =
            'Erreur lors de la création de la remise. Veuillez réessayer.';
          this.discountErrorMessage = this.toastMessage;
        }
        setTimeout(() => this.closeToast(), 3000);
        this.cdr.detectChanges();
      },
    });
  }

  closeToast(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastTitle = 'Success';
    this.cdr.detectChanges();
  }
}
