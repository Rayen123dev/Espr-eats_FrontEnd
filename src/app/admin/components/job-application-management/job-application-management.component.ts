import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from 'src/app/services/job-application.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-application-management',
  templateUrl: './job-application-management.component.html',
  styleUrls: ['./job-application-management.component.css']
})
export class JobApplicationManagementComponent implements OnInit {
  applications: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  filteredApplications: any[] = []; 
  searchKeyword: string = '';
  isSearching: boolean = false;
  constructor(
    private jobApplicationService: JobApplicationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.jobApplicationService.getAllApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.filteredApplications = apps; 
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load applications.';
        this.isLoading = false;
      }
    });
  }

  downloadAttachment(filename: string): void {
    const url = `http://localhost:8081/uploads/cv/${filename}`;
    window.open(url, '_blank');
  }

  showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 3000 });
  }

  processCV(application: any): void {
    this.jobApplicationService.processCV(application.jobAppID).subscribe({
      next: (response: any) => {
        application.cvScore = response.replace(/^"|"$/g, '');
        console.log('Processed CV:', application.cvScore);
  
        // ✅ Show only in snackbar
        this.showSnackBar('CV Match Result: ' + application.cvScore, 'Close');
      },
      error: (error: any) => {
        console.error('Error processing CV', error);
        this.showSnackBar('Error processing CV.', 'Close');
      }
    });
  }
  searchApplications(): void {
    if (!this.searchKeyword.trim()) {
      this.filteredApplications = this.applications;
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    const keyword = this.searchKeyword.toLowerCase();

    this.filteredApplications = this.applications.filter(app =>
      (app.jobOffer?.title?.toLowerCase().includes(keyword) || '') ||
      (app.motivationAttachment?.toLowerCase().includes(keyword) || '')
    );
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.isSearching = false;
    this.filteredApplications = this.applications;
  }
  
  
  
}
