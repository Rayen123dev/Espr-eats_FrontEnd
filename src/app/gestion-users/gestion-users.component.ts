import { Component, OnInit } from '@angular/core';
import * as Chartist from 'chartist';
import { LoginService, User } from '../login.service';
import { Router } from '@angular/router';
import { ReclamationService } from '../reclamation.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './gestion-users.component.html',
  styleUrls: ['./gestion-users.component.css']
})
export class GestionUsersComponent implements OnInit {
  id: any;
  userName: string = 'User';
  userProfileImage: string = 'assets/default-avatar.png';
  userRole: string | null = null;
  Users: any[] = [];
  nbUsers: number = 0;
  nbAdmins: number = 0;
  nbUsersT: number = 0;
  nbMedecins: number = 0;
  nbReclamations: number = 0;
  nbReclamationsP: number = 0;
  nbReclamationsI: number = 0;
  nbReclamationsR: number = 0;
  nbReclamationsC: number = 0;
  reclamations: any[] = [];
  statusFilter: string = 'ALL';
  filteredUsers: User[] = [];
  Chartist: any = Chartist;


  // Chart instances
  userDistributionChart: any;
  reclamationStatusChart: any;
  monthlyReclamationsChart: any;
  weeklyTrendsChart: any;

  // Status translation map
  private statusLabels: { [key: string]: string } = {
    'Admin': 'Admin',
    'User': 'User',
    'Staff': 'Staff',
    'Medcin': 'Medcin'
  };
  subscription: any;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private reclamationService: ReclamationService
  ) { }

  filterUser(status: string): void {
    this.statusFilter = status;
    this.filteredUsers = status === 'ALL' 
      ? this.Users
      : this.Users.filter(u => u.role === status);
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserData();
    this.loadReclamationsData();
  }

  loadUserProfile(): void {
    const userId = this.loginService.getUserIdFromToken();
    this.id = userId;
    
    if (userId) {
      this.loginService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.userName = user.nom;
          this.userProfileImage = user.link_Image || this.userProfileImage;
          this.userRole = this.loginService.getRole();
        },
        error: (error) => {
          console.error('Error fetching user profile', error);
        }
      });
    }
  }

  loadUserData(): void {
    this.loginService.getUsers().subscribe(users => {
      this.Users = users;
      this.filteredUsers = users;
      this.nbUsersT = users.length;
      this.nbAdmins = users.filter(user => user.role === 'Admin').length;
      this.nbUsers = users.filter(user => user.role === 'User').length;
      this.nbMedecins = users.filter(user => user.role === 'Medecin').length;
      
      // Initialize user distribution chart
      this.initUserDistributionChart();
    });
  }

  getStatusClass(status: string): string {
    return status === 'online' ? 'status-online' : 'status-offline';
  }

  loadReclamationsData(): void {
    this.reclamationService.getAllReclamations().subscribe(reclamations => {
      this.reclamations = reclamations;
      this.nbReclamations = reclamations.length;
      this.nbReclamationsP = reclamations.filter(r => r.status === 'PENDING').length;
      this.nbReclamationsI = reclamations.filter(r => r.status === 'IN_PROGRESS').length;
      this.nbReclamationsR = reclamations.filter(r => r.status === 'RESOLVED').length;
      this.nbReclamationsC = reclamations.filter(r => r.status === 'CLOSED').length;
      
      // Initialize reclamation charts
      this.initReclamationStatusChart();
      this.initMonthlyReclamationsChart();
      this.initWeeklyTrendsChart();
    });
  }

  initUserDistributionChart(): void {
    const data = {
      labels: ['Admin', 'User', 'Medecin', 'Staff'],
      series: [this.nbAdmins, this.nbUsers, this.nbMedecins, 
               this.nbUsersT - (this.nbAdmins + this.nbUsers + this.nbMedecins)]
    };

    const options = {
      donut: true,
      donutWidth: 60,
      startAngle: 270,
      total: this.nbUsersT * 1.5, // Adjust to make the donut look nicer
      showLabel: true,
      labelInterpolationFnc: function(value: string, index: number) {
        return value + ' (' + data.series[index] + ')';
      }
    };

    this.userDistributionChart = new this.Chartist.Pie('#userDistributionChart', data, options);
  }

  initReclamationStatusChart(): void {
    const data = {
      labels: ['Pending', 'In Progress', 'Resolved', 'Closed'],
      series: [
        [this.nbReclamationsP, this.nbReclamationsI, this.nbReclamationsR, this.nbReclamationsC]
      ]
    };

    const options = {
      high: Math.max(this.nbReclamationsP, this.nbReclamationsI, this.nbReclamationsR, this.nbReclamationsC) + 2,
      low: 0,
      axisX: {
        showGrid: false
      },
      seriesBarDistance: 10,
      classNames: {
        bar: 'ct-bar-custom'
      }
    };

    const responsiveOptions = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value: any) {
            return value[0];
          }
        }
      }]
    ];

    this.reclamationStatusChart = new this.Chartist.Bar('#reclamationStatusChart', data, options, responsiveOptions);
    this.applyBarChartColors();
  }

  applyBarChartColors(): void {
    if (this.reclamationStatusChart) {
      this.reclamationStatusChart.on('draw', function(data: any) {
        if (data.type === 'bar') {
          const colors = ['#FF3E3E', '#FFB930', '#20F174', '#3ECDFF'];
          data.element.attr({
            style: 'stroke: ' + colors[data.index] + '; stroke-width: 25px'
          });
        }
      });
    }
  }

  initMonthlyReclamationsChart(): void {
    // This would normally come from aggregated backend data
    // For now using dummy data that resembles monthly stats
    const monthlyData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [
        [5, 8, 12, 7, 9, 11, 14, 10, 13, 9, 12, 8]  // Example data
      ]
    };

    const options = {
      fullWidth: true,
      chartPadding: {
        right: 40
      },
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0.2
      }),
      low: 0
    };

    this.monthlyReclamationsChart = new this.Chartist.Line('#monthlyReclamationsChart', monthlyData, options);
    this.startAnimationForLineChart(this.monthlyReclamationsChart);
  }

  initWeeklyTrendsChart(): void {
    // Example data for users registered per week
    const weeklyData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      series: [
        [5, 9, 7, 8],  // Admins
        [15, 12, 17, 14], // Users
        [3, 2, 4, 5]   // Medecins
      ]
    };

    const options = {
      stackBars: true,
      axisY: {
        labelInterpolationFnc: function(value: any) {
          return value;
        }
      }
    };

    this.weeklyTrendsChart = new this.Chartist.Bar('#weeklyTrendsChart', weeklyData, options);
    
    // Stack the bars and apply colors
    this.weeklyTrendsChart.on('draw', function(data: any) {
      if(data.type === 'bar') {
        const colors = ['#3444d5', '#FFB930', '#20F174'];
        data.element.attr({
          style: 'stroke: ' + colors[data.seriesIndex] + '; stroke-width: 30px'
        });
        
        // Animation
        data.element.animate({
          y2: {
            begin: 0,
            dur: 500,
            from: data.y1,
            to: data.y2,
            easing: 'easeOutQuad'
          }
        });
      }
    });
  }

  startAnimationForLineChart(chart: any) {
    let seq: number = 0;
    let delays: number = 80;
    let durations: number = 500;

    chart.on('draw', function(data: any) {
      if(data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if(data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  }

  resolveReclamation(id: any) {
    this.reclamationService.resuluReclamation(id).subscribe(
      response => {
        console.log('Reclamation resolved:', response);
        // Refresh reclamation data to update charts
        this.loadReclamationsData();
      },
      error => {
        console.error('Error resolving reclamation:', error);
      }
    );
  }

  closeReclamation(id: any) {
    this.reclamationService.closeReclamation(id).subscribe(
      response => {
        console.log('Reclamation closed:', response);
        // Refresh reclamation data to update charts
        this.loadReclamationsData();
      },
      error => {
        console.error('Error closing reclamation:', error);
      }
    );
  }
}