import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Chartist from 'chartist';
import { LineChart } from 'chartist';
import { BarChart } from 'chartist';
import { PieChart } from 'chartist';
import { LoginService, User } from '../login.service';
import { Router } from '@angular/router';
import { ReclamationService } from '../reclamation.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-dashboard',
  templateUrl: './gestion-users.component.html',
  styleUrls: ['./gestion-users.component.css']
})
export class GestionUsersComponent implements OnInit, OnDestroy {
  id: any;
  userName: string = 'User';
  userProfileImage: string = 'assets/default-avatar.png';
  userRole: string | null = null;
  Users: any[] = [];
  verified: boolean = false;
  nbUsers: number = 0;
  nbAdmins: number = 0;
  nbUsersT: number = 0;
  nbMedecins: number = 0;
  nbReclamations: number = 0;
  nbReclamationsP: number = 0;
  nbReclamationsI: number = 0;
  nbReclamationsR: number = 0;
  nbReclamationsC: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  reclamations: any[] = [];
  statusFilter: string = 'ALL';
  filteredUsers: User[] = [];
  Chartist: any = Chartist;
  userId: number | null = null;

  searchQuery: string = '';



  // Make Math accessible to template
  Math = Math;

  public statusLabels: { [key: string]: string } = {
    ALL: 'Tous les utilisateurs',
    Admin: 'Admin',
    User: 'Etudiants',
    Medecin: 'Médecins',
    Staff: 'Staff',
    Medcin: 'Medcin'
  };

  // Chart instances
  userDistributionChart: any;
  reclamationStatusChart: any;
  monthlyReclamationsChart: any;
  weeklyTrendsChart: any;

  // Store subscriptions for proper cleanup
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private loginService: LoginService,
    private reclamationService: ReclamationService
  ) { }

  filterUser(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1; // Reset to first page when changing filters
    this.loadPaginatedUsers(); // This should take the filter into account
  }

  ngOnInit() {
    this.currentPage = 1; // Reset to first page
    
    this.loadUserProfile();
    this.loadReclamationsData();
    this.loadUserData();
    this.loadUserDataForStat();
    this.loadPaginatedUsers();
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserProfile(): void {
    const userId = this.loginService.getUserIdFromToken();
    this.id = userId;

    if (userId) {
      const sub = this.loginService.getUserById(userId).subscribe({
        next: (user: User) => {
          this.userName = user.nom;
          this.userProfileImage = user.link_Image || this.userProfileImage;
          this.userRole = this.loginService.getRole();
        },
        error: (error) => {
          console.error('Error fetching user profile', error);
        }
      });
      this.subscriptions.push(sub);
    }
  }
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1; // MatPaginator is 0-based
    this.loadPaginatedUsers(); // Re-fetch users with new page info
  }
  loadUserDataForStat(): void {
    const sub = this.loginService.getUsers().subscribe(users => {
      this.filteredUsers = users;
      this.nbUsersT = users.length;
      this.nbAdmins = users.filter(user => user.role === 'Admin').length;
      this.nbUsers = users.filter(user => user.role === 'User').length;
      this.nbMedecins = users.filter(user => user.role === 'Medecin').length;
      console.log('Daaaaaaaaaaaaata:',users );
      // Initialize chart after data is loaded
      setTimeout(() => {
        this.initUserDistributionChart();
      }, 0);
    });
  }


  loadUserData(): void {
    this.loadPaginatedUsers();
    const sub = this.loginService.getUsersP().subscribe(users => {
      this.Users = users;

      // Initialize chart after data is loaded
      setTimeout(() => {
        this.initUserDistributionChart();
      }, 0);
    });
    this.subscriptions.push(sub);
}

searchUsers(): void {
  this.loginService.searchUsers(this.searchQuery).subscribe({
    next: (response) => {
      this.Users = response || [];
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      console.log(response);

      // Update filteredUsers after getting the response
      this.filteredUsers = this.getFilteredUsers();
    },
    error: (error) => {
      console.error('Error searching users:', error);
      this.Users = [];
    }
  });
}


   

loadPaginatedUsers(): void {
  // If a search is active, use searchUsers
  if (this.searchQuery && this.searchQuery.trim().length > 0) {
    this.searchUsers();
    return;
  }

  // Otherwise, load normally with filters
  const params = {
    page: this.currentPage,
    size: this.pageSize,
    filter: this.statusFilter !== 'ALL' ? this.statusFilter : undefined
  };

  const sub = this.loginService.getPaginatedUsers(params).subscribe({
    next: (response) => {
      this.filteredUsers = response.data;
      this.totalItems = response.totalItems || 0;
      this.totalPages = response.totalPages || Math.ceil(this.totalItems / this.pageSize);
    },
    error: (error) => {
      console.error('Error fetching users:', error);
      this.filteredUsers = [];
    }
  });

  this.subscriptions.push(sub);
}

  // Update page
  setPage(page: number): void {
    if (page < 1 || (this.totalPages > 0 && page > this.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadPaginatedUsers();
  }

  // Handle page size change
  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page
    this.loadPaginatedUsers();
  }

  // Calculate visible page numbers
  pageRange(): number[] {
    const maxVisiblePages = 5;

    if (!this.totalPages || this.totalPages <= 0) {
      return [1];
    }

    if (this.totalPages <= maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(this.currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  getStatusClass(status: string): string {
    return status === 'online' ? 'status-online' : 'status-offline';
  }

  loadReclamationsData(): void {
    const sub = this.reclamationService.getAllReclamations().subscribe(reclamations => {
      this.reclamations = reclamations || [];
      this.nbReclamations = this.reclamations.length;
      this.nbReclamationsP = this.reclamations.filter(r => r.status === 'PENDING').length;
      this.nbReclamationsI = this.reclamations.filter(r => r.status === 'IN_PROGRESS').length;
      this.nbReclamationsR = this.reclamations.filter(r => r.status === 'RESOLVED').length;
      this.nbReclamationsC = this.reclamations.filter(r => r.status === 'CLOSED').length;

      // Initialize charts after data is available
      setTimeout(() => {
        this.initReclamationStatusChart();
        this.initMonthlyReclamationsChart();
        this.initWeeklyTrendsChart();
      }, 0);
    });
    this.subscriptions.push(sub);
  }

  initUserDistributionChart(): void {
    try {
      const element = document.querySelector('#userDistributionChart');
      if (!element) {
        console.error('Chart element not found');
        return;
      }

      const data = {
        labels: ['Admin', 'User', 'Medecin', 'Staff'],
        series: [
          this.nbAdmins,
          this.nbUsers,
          this.nbMedecins,
          this.nbUsersT - (this.nbAdmins + this.nbUsers + this.nbMedecins)
        ]
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

      this.userDistributionChart = new PieChart('#userDistributionChart', data, options);
    } catch (error) {
      console.error('Error initializing user distribution chart:', error);
    }
  }

  initReclamationStatusChart(): void {
    try {
      const element = document.querySelector('#reclamationStatusChart');
      if (!element) {
        console.error('Chart element not found');
        return;
      }

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

      this.reclamationStatusChart = new Chartist.BarChart('#reclamationStatusChart', data);
      this.startAnimationForLineChart(this.reclamationStatusChart);
      this.applyBarChartColors();
    } catch (error) {
      console.error('Error initializing reclamation status chart:', error);
    }
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
    try {
      const element = document.querySelector('#monthlyReclamationsChart');
      if (!element) {
        console.error('Chart element not found');
        return;
      }

      // This would normally come from aggregated backend data
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
      this.monthlyReclamationsChart = new LineChart('#monthlyReclamationsChart', monthlyData, options);
      this.startAnimationForLineChart(this.monthlyReclamationsChart);
    } catch (error) {
      console.error('Error initializing monthly reclamations chart:', error);
    }
  }

  initWeeklyTrendsChart(): void {
    try {
      const element = document.querySelector('#weeklyTrendsChart');
      if (!element) {
        console.error('Chart element not found');
        return;
      }

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

      this.weeklyTrendsChart = new Chartist.BarChart('#weeklyTrendsChart', weeklyData, options);

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
    } catch (error) {
      console.error('Error initializing weekly trends chart:', error);
    }
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
    const sub = this.reclamationService.resuluReclamation(id).subscribe({
      next: (response) => {
        console.log('Reclamation resolved:', response);
        // Refresh reclamation data to update charts
        this.loadReclamationsData();
      },
      error: (error) => {
        console.error('Error resolving reclamation:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  closeReclamation(id: any) {
    const sub = this.reclamationService.closeReclamation(id).subscribe({
      next: (response) => {
        console.log('Reclamation closed:', response);
        // Refresh reclamation data to update charts
        this.loadReclamationsData();
      },
      error: (error) => {
        console.error('Error closing reclamation:', error);
      }
    });
    this.subscriptions.push(sub);
  }
  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page
    this.loadPaginatedUsers();
  }

  BloquerUser(id: any) {
    const sub = this.loginService.BlocUser(id).subscribe({
      next: (response) => {
        console.log('User blocked:', response);
        this.loadUserData();
        this.loadPaginatedUsers();
      },
      error: (error) => {
        console.error('Error blocking user:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  ActiverUser(id: any) {
    const sub = this.loginService.ActiveUser(id).subscribe({
      next: (response) => {
        console.log('User blocked:', response);
        this.loadUserData();
        this.loadPaginatedUsers();
      },
      error: (error) => {
        console.error('Error blocking user:', error);
      }
    });
    this.subscriptions.push(sub);
  }


  getFilteredUsers(): User[] {
    return this.Users
      .filter(u => this.statusFilter === 'ALL' || u.role === this.statusFilter)
      .filter(u => {
        const q = this.searchQuery.toLowerCase();
        return (
          u.nom?.toLowerCase().includes(q) ||
          u.prenom?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q)
        );
      });
  }
  

}
