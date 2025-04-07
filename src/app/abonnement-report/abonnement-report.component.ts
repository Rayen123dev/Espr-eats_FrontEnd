import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  AbonnementService,
  SubscriptionReport,
  Abonnement,
  TypeAbonnement,
  AbonnementStatus,
} from 'src/abonnement.service';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-abonnement-report',
  templateUrl: './abonnement-report.component.html',
  styleUrls: ['./abonnement-report.component.css'],
})
export class AbonnementReportComponent implements OnInit {
  report: SubscriptionReport | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Table data
  abonnements: Abonnement[] = [];
  isLoadingTable: boolean = false;
  tableErrorMessage: string = '';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchSubscriptionReport();
  }

  fetchSubscriptionReport(): void {
    this.isLoading = true;
    this.abonnementService.getSubscriptionReport().subscribe({
      next: (report) => {
        this.report = report;
        this.updateCharts();
        this.isLoading = false;
        this.errorMessage = '';

        // Show notification if there are blocked subscriptions
        if (report.blockedSubscriptions > 0) {
          this.showBlockedNotification = true;
          setTimeout(() => {
            this.showBlockedNotification = false;
            this.cdr.detectChanges();
          }, 5000); // Auto-hide after 5 seconds
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

    if (this.selectedType && this.selectedStatus) {
      this.fetchByTypeAndStatus();
    } else if (this.selectedType) {
      this.abonnementService.getAbonnementsByType(this.selectedType).subscribe({
        next: (abonnements) => {
          this.abonnements = abonnements;
          // Force some abonnements to be blocked for testing
          if (this.abonnements.length > 0) {
            this.abonnements[0].isBlocked = true;
          }
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
            this.abonnements = abonnements;
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
    }
  }

  fetchByTypeAndStatus(): void {
    this.abonnementService.getAbonnementsByType(this.selectedType).subscribe({
      next: (abonnementsByType) => {
        this.abonnementService
          .getAbonnementsByStatus(this.selectedStatus)
          .subscribe({
            next: (abonnementsByStatus) => {
              this.abonnements = abonnementsByType.filter((abonnement) =>
                abonnementsByStatus.some(
                  (a) => a.idAbonnement === abonnement.idAbonnement
                )
              );
              this.isLoadingTable = false;
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

  onFilterChange(): void {
    this.fetchAbonnements();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedStatus = '';
    this.abonnements = [];
    this.tableErrorMessage = '';
  }

  toggleBlockedStatus(idAbonnement: number): void {
    console.log('Before toggle - ID:', idAbonnement);
    const abonnement = this.abonnements.find(
      (a) => a.idAbonnement === idAbonnement
    );
    console.log('Current state:', abonnement?.isBlocked);

    // Optimistically update the UI
    const index = this.abonnements.findIndex(
      (a) => a.idAbonnement === idAbonnement
    );
    if (index !== -1 && abonnement) {
      this.abonnements[index].isBlocked = !abonnement.isBlocked; // Toggle locally
      this.abonnements = [...this.abonnements];
      this.cdr.detectChanges();
      console.log(
        'Local state updated optimistically:',
        this.abonnements[index].isBlocked
      );
    }

    this.toggleErrorMessage = '';
    this.toggleSuccessMessage = '';

    // Sync with API
    this.abonnementService.unblockAbonnement(idAbonnement).subscribe({
      next: (updatedAbonnement) => {
        console.log('API response - New state:', updatedAbonnement.isBlocked);

        // Update local state with API response
        if (index !== -1) {
          this.abonnements[index].isBlocked = updatedAbonnement.isBlocked;
          this.abonnements = [...this.abonnements];
          this.cdr.detectChanges();
          console.log(
            'Updated local state from API:',
            this.abonnements[index].isBlocked
          );
        }

        this.toggleSuccessMessage = `Abonnement ${
          updatedAbonnement.isBlocked ? 'blocked' : 'unblocked'
        } successfully!`;
        setTimeout(() => (this.toggleSuccessMessage = ''), 3000);

        // Update charts without full reload
        if (this.report) {
          this.report.blockedSubscriptions = this.abonnements.filter(
            (a) => a.isBlocked
          ).length;
          this.updateCharts();
        }
      },
      error: (error) => {
        console.error('API Error:', error);
        if (index !== -1 && abonnement) {
          this.abonnements[index].isBlocked = abonnement.isBlocked; // Revert on error
          this.abonnements = [...this.abonnements];
          this.cdr.detectChanges();
        }
        this.toggleErrorMessage = 'Failed to update status';
        setTimeout(() => (this.toggleErrorMessage = ''), 3000);
      },
    });
  }

  closeBlockedNotification(): void {
    this.showBlockedNotification = false;
    this.cdr.detectChanges();
  }
}
