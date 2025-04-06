import { Component, OnInit } from '@angular/core';
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

  // Dropdown options for filtering
  types: string[] = Object.values(TypeAbonnement);
  statuses: string[] = Object.values(AbonnementStatus);
  selectedType: string = ''; // Default to no filter
  selectedStatus: string = ''; // Default to no filter

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
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Croissance Mensuelle des Abonnements',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Mois',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Nombre d'Abonnements",
        },
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
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: "Répartition des Statuts d'Abonnement",
      },
    },
  };
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;

  constructor(private abonnementService: AbonnementService) {}

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

    // Update Line Chart (Monthly Growth)
    const monthlyGrowthEntries = Object.keys(report.monthlyGrowth)
      .map((month) => ({
        month,
        count: report.monthlyGrowth[month],
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    this.lineChartData.labels = monthlyGrowthEntries.map(
      (entry) => entry.month
    );
    this.lineChartData.datasets[0].data = monthlyGrowthEntries.map(
      (entry) => entry.count
    );

    // Update Pie Chart (Subscription Status Distribution)
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

  // Table-related methods
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
          this.isLoadingTable = false;
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
}
