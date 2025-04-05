import { Component, OnInit } from '@angular/core';
import { AbonnementService, SubscriptionReport } from 'src/abonnement.service';
import { ChartOptions, ChartType } from 'chart.js'; // Import from chart.js

@Component({
  selector: 'app-abonnement-report',
  templateUrl: './abonnement-report.component.html',
  styleUrls: ['./abonnement-report.component.css'],
})
export class AbonnementReportComponent implements OnInit {
  report: SubscriptionReport | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

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
    labels: ['Actifs', 'En Attente', 'Expirés'],
    datasets: [
      {
        data: [0, 0, 0], // Will be updated with actual values
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#e0a800', '#c82333'],
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
    // Ensure report is not null before proceeding
    if (!this.report) {
      console.warn('Cannot update charts: report is null');
      return;
    }

    // Assign this.report to a local variable to help TypeScript with type narrowing
    const report: SubscriptionReport = this.report;

    // Update Line Chart (Monthly Growth)
    const monthlyGrowthEntries = Object.keys(report.monthlyGrowth)
      .map((month) => ({
        month,
        count: report.monthlyGrowth[month],
      }))
      .sort((a, b) => a.month.localeCompare(b.month)); // Sort by month

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
    ];
  }

  retryFetchReport(): void {
    this.errorMessage = '';
    this.fetchSubscriptionReport();
  }
}
