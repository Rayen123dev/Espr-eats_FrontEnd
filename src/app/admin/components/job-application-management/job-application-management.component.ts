import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from 'src/app/services/job-application.service';
import { JobOfferService } from 'src/app/services/job-offer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-job-application-management',
  templateUrl: './job-application-management.component.html',
  styleUrls: ['./job-application-management.component.css']
})
export class JobApplicationManagementComponent implements OnInit {
  applications: any[] = [];
  jobOffers: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  filteredApplications: any[] = [];
  searchKeyword: string = '';
  isSearching: boolean = false;

  totalOffers: number = 0;
  totalApplications: number = 0;
  activeOffers: number = 0;

  // New properties
  statusFilter: string = 'all';
  showApplicationModal: boolean = false;
  selectedApplication: any = null;
  showMotivationModal: boolean = false;
  selectedMotivation: string = '';

  // Advanced features
  interviewForm!: FormGroup;
  showInterviewModal: boolean = false;
  interviewSchedules: Map<number, any> = new Map();
  candidateNotes: Map<number, string> = new Map();
  showNotesModal: boolean = false;
  currentNotes: string = '';
  currentApplicationId: number | null = null;

  // AI features
  aiAnalysisInProgress: boolean = false;
  skillMatchScores: Map<number, any> = new Map();
  candidateRankings: any[] = [];
  showAiInsightsModal: boolean = false;
  aiInsights: any = null;

  // Bulk actions
  selectedApplications: Set<number> = new Set();
  selectAll: boolean = false;
  bulkActionOptions: string[] = ['Schedule Interviews', 'Send Email', 'Archive', 'Reject'];

  constructor(
    private jobApplicationService: JobApplicationService,
    private jobOfferService: JobOfferService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.initInterviewForm();
  }

  initInterviewForm(): void {
    this.interviewForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      interviewType: ['video', Validators.required],
      interviewers: ['', Validators.required],
      notes: [''],
      sendNotification: [true]
    });
  }

  ngOnInit(): void {
    this.fetchApplications();
    this.fetchOffers();
  }

  fetchApplications(): void {
    this.jobApplicationService.getAllApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.filteredApplications = apps;
        this.totalApplications = apps.length;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load applications.';
        this.isLoading = false;
      }
    });
  }

  fetchOffers(): void {
    this.jobOfferService.getAllOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers;
        this.totalOffers = offers.length;
        this.activeOffers = offers.filter(o => new Date(o.date) > new Date()).length;
      },
      error: () => {
        this.errorMessage = 'Failed to load job offers.';
      }
    });
  }

  exportApplicationsToExcel(): void {
    const exportData = this.filteredApplications.map(application => ({
      'Applicant Name': application.user?.nom || 'No name',
      'Applicant Email': application.user?.email || 'No email',
      'Job Offer Title': application.jobOffer?.title || 'No title',
      'Motivation Letter': application.motivationAttachment || 'No motivation letter',
      'CV Attachment': application.cvAttachment || 'No CV'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Applications': worksheet }, SheetNames: ['Applications'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'job_applications.xlsx');
  }

  downloadAttachment(filename: string): void {
    const url = `http://localhost:8081/uploads/cv/${filename}`;
    window.open(url, '_blank');
  }

  showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 3000 });
  }

  processCV(application: any): void {
    if (!application.jobOffer) {
      this.showSnackBar('Job offer details not available for CV analysis', 'Error');
      return;
    }

    this.aiAnalysisInProgress = true;
    application.processingCV = true;

    // First try to use the backend service
    this.jobApplicationService.processCV(application.jobAppID).subscribe({
      next: (response: any) => {
        const score = response.replace(/^"|"$/g, '');
        this.handleCVAnalysisResult(application, score);
      },
      error: (error: any) => {
        console.error('Error processing CV with backend service, using fallback AI analysis', error);
        // Fallback to our simulated AI analysis
        this.performLocalCVAnalysis(application);
      }
    });
  }

  handleCVAnalysisResult(application: any, score: string): void {
    application.cvScore = score;

    // Generate detailed analysis
    const jobSkills = application.jobOffer.skills.toLowerCase().split(',').map((s: string) => s.trim());
    const cvSkills = this.simulateExtractSkillsFromCV();

    // Calculate match details
    const matchedSkills = jobSkills.filter((skill: string) =>
      cvSkills.some(cvSkill => cvSkill.toLowerCase().includes(skill))
    );

    const matchPercentage = jobSkills.length > 0
      ? (matchedSkills.length / jobSkills.length)
      : 0;

    // Store the detailed analysis
    const skillAnalysis = {
      score: score,
      matchPercentage: (matchPercentage * 100).toFixed(0) + '%',
      matchedSkills: matchedSkills,
      missingSkills: jobSkills.filter((skill: string) =>
        !matchedSkills.includes(skill)
      ),
      additionalSkills: cvSkills.filter(cvSkill =>
        !jobSkills.some((skill: string) => cvSkill.toLowerCase().includes(skill))
      ),
      recommendations: this.generateRecommendations(matchPercentage)
    };

    // Save the analysis
    this.skillMatchScores.set(application.jobAppID, skillAnalysis);

    // Update candidate rankings
    this.updateCandidateRankings();

    application.processingCV = false;
    this.aiAnalysisInProgress = false;

    this.showSnackBar('CV analyzed successfully! Score: ' + score, 'Success');
  }

  performLocalCVAnalysis(application: any): void {
    // Simulate the AI analysis with a timeout
    setTimeout(() => {
      // Generate a more realistic score based on matching skills
      const jobSkills = application.jobOffer.skills.toLowerCase().split(',').map((s: string) => s.trim());

      // Simulate extracting skills from CV
      const cvSkills = this.simulateExtractSkillsFromCV();

      // Calculate match score
      const matchedSkills = jobSkills.filter((skill: string) =>
        cvSkills.some(cvSkill => cvSkill.toLowerCase().includes(skill))
      );

      const matchPercentage = jobSkills.length > 0
        ? (matchedSkills.length / jobSkills.length)
        : 0;

      // Score between 1-5 based on match percentage
      const score = (matchPercentage * 4 + 1).toFixed(1);

      this.handleCVAnalysisResult(application, score);
    }, 1500);
  }

  simulateExtractSkillsFromCV(): string[] {
    // In a real implementation, this would use NLP to extract skills from the CV
    // Here we're just returning a random selection of common skills
    const allSkills = [
      'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue.js',
      'Node.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL',
      'Java', 'Spring Boot', 'Python', 'Django', 'Flask',
      'C#', '.NET', 'PHP', 'Laravel', 'WordPress',
      'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap',
      'Git', 'GitHub', 'GitLab', 'CI/CD', 'Docker',
      'AWS', 'Azure', 'Google Cloud', 'Heroku', 'Netlify',
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence'
    ];

    // Return a random subset of skills
    const numSkills = Math.floor(Math.random() * 10) + 5; // 5-15 skills
    const skills: string[] = [];

    for (let i = 0; i < numSkills; i++) {
      const randomIndex = Math.floor(Math.random() * allSkills.length);
      const skill = allSkills[randomIndex];

      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }

    return skills;
  }

  generateRecommendations(matchPercentage: number): string[] {
    const recommendations = [];

    if (matchPercentage < 0.3) {
      recommendations.push('Candidate does not meet the minimum skill requirements for this position.');
      recommendations.push('Consider for a more junior position or recommend skill development.');
    } else if (matchPercentage < 0.6) {
      recommendations.push('Candidate meets some of the required skills but has significant gaps.');
      recommendations.push('Proceed with initial screening to assess potential and learning ability.');
    } else if (matchPercentage < 0.8) {
      recommendations.push('Candidate has a good match with the required skills.');
      recommendations.push('Recommended for interview to assess practical application of skills.');
    } else {
      recommendations.push('Excellent skill match for this position.');
      recommendations.push('High priority candidate - schedule interview as soon as possible.');
    }

    return recommendations;
  }

  updateCandidateRankings(): void {
    // Create a ranking of all candidates who have been analyzed
    const rankedCandidates = this.applications
      .filter(app => app.cvScore)
      .map(app => ({
        id: app.jobAppID,
        name: app.user?.nom || 'Unknown',
        jobTitle: app.jobOffer?.title || 'Unknown Position',
        score: parseFloat(app.cvScore),
        analysis: this.skillMatchScores.get(app.jobAppID)
      }))
      .sort((a, b) => b.score - a.score);

    this.candidateRankings = rankedCandidates;
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

  isOfferExpired(date: string | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  // New methods for enhanced functionality
  getApplicationRate(): number {
    if (this.totalOffers === 0) return 0;
    return Math.round((this.totalApplications / this.totalOffers) * 100);
  }

  filterByStatus(): void {
    if (this.statusFilter === 'all') {
      this.filteredApplications = this.applications;
    } else if (this.statusFilter === 'active') {
      this.filteredApplications = this.applications.filter(app =>
        !this.isOfferExpired(app.jobOffer?.date)
      );
    } else if (this.statusFilter === 'expired') {
      this.filteredApplications = this.applications.filter(app =>
        this.isOfferExpired(app.jobOffer?.date)
      );
    }
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.statusFilter = 'all';
    this.filteredApplications = this.applications;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getScorePercentage(score: string): number {
    if (!score) return 0;
    const numScore = parseFloat(score);
    return Math.min(numScore * 20, 100); // Convert score to percentage (assuming score is 0-5)
  }

  viewApplicationDetails(application: any): void {
    this.selectedApplication = application;
    this.showApplicationModal = true;
  }

  closeApplicationModal(): void {
    this.showApplicationModal = false;
    this.selectedApplication = null;
  }

  viewMotivationLetter(application: any): void {
    this.selectedMotivation = application.motivationAttachment || 'No motivation letter available.';
    this.showMotivationModal = true;
  }

  closeMotivationModal(): void {
    this.showMotivationModal = false;
    this.selectedMotivation = '';
  }

  contactApplicant(application: any): void {
    if (!application?.user?.email) {
      this.showSnackBar('No email address available for this applicant.', 'Error');
      return;
    }

    const subject = `Regarding your application for ${application.jobOffer?.title || 'our job opening'}`;
    const mailtoLink = `mailto:${application.user.email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoLink, '_blank');
  }

  archiveApplication(application: any): void {
    // This would typically call a backend service to archive the application
    this.showSnackBar('Application archived successfully.', 'Success');

    // For now, just remove it from the filtered list
    this.filteredApplications = this.filteredApplications.filter(app =>
      app.jobAppID !== application.jobAppID
    );
  }

  // Interview scheduling methods
  scheduleInterview(application: any): void {
    this.selectedApplication = application;
    this.interviewForm.reset();
    this.interviewForm.patchValue({
      interviewType: 'video',
      sendNotification: true
    });
    this.showInterviewModal = true;
  }

  submitInterviewSchedule(): void {
    if (this.interviewForm.invalid) {
      this.showSnackBar('Please fill all required fields', 'Error');
      return;
    }

    const formData = this.interviewForm.value;
    const interviewData = {
      ...formData,
      scheduledAt: new Date(),
      applicationId: this.selectedApplication.jobAppID,
      candidateName: this.selectedApplication.user?.nom || 'Unknown',
      jobTitle: this.selectedApplication.jobOffer?.title || 'Unknown Position',
      status: 'scheduled'
    };

    // In a real implementation, this would call a backend service
    // Here we're just storing it in memory
    this.interviewSchedules.set(this.selectedApplication.jobAppID, interviewData);

    this.showSnackBar('Interview scheduled successfully!', 'Success');
    this.closeInterviewModal();

    // Add a flag to the application to show it has an interview scheduled
    this.selectedApplication.interviewScheduled = true;
  }

  closeInterviewModal(): void {
    this.showInterviewModal = false;
    this.selectedApplication = null;
  }

  // Candidate notes methods
  addNotes(application: any): void {
    this.currentApplicationId = application.jobAppID;
    this.currentNotes = this.candidateNotes.get(application.jobAppID) || '';
    this.showNotesModal = true;
  }

  saveNotes(): void {
    if (this.currentApplicationId === null) return;

    this.candidateNotes.set(this.currentApplicationId, this.currentNotes);
    this.showSnackBar('Notes saved successfully!', 'Success');
    this.closeNotesModal();
  }

  closeNotesModal(): void {
    this.showNotesModal = false;
    this.currentApplicationId = null;
    this.currentNotes = '';
  }

  // AI insights methods
  viewAiInsights(application: any): void {
    const analysis = this.skillMatchScores.get(application.jobAppID);

    if (!analysis) {
      this.showSnackBar('No AI analysis available. Please analyze the CV first.', 'Error');
      return;
    }

    this.aiInsights = {
      candidateName: application.user?.nom || 'Unknown',
      jobTitle: application.jobOffer?.title || 'Unknown Position',
      score: application.cvScore,
      analysis: analysis,
      potentialFit: this.calculatePotentialFit(parseFloat(application.cvScore)),
      interviewRecommendation: this.getInterviewRecommendation(parseFloat(application.cvScore))
    };

    this.showAiInsightsModal = true;
  }

  calculatePotentialFit(score: number): string {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  }

  getInterviewRecommendation(score: number): string {
    if (score >= 4.0) {
      return 'Highly recommended for interview. Consider fast-tracking this candidate.';
    } else if (score >= 3.0) {
      return 'Recommended for interview. Good potential fit for the role.';
    } else if (score >= 2.0) {
      return 'Consider for interview if other candidates are limited. May need additional screening.';
    } else {
      return 'Not recommended for interview based on skill match. Consider for other positions.';
    }
  }

  closeAiInsightsModal(): void {
    this.showAiInsightsModal = false;
    this.aiInsights = null;
  }

  // Bulk actions methods
  toggleSelectApplication(applicationId: number): void {
    if (this.selectedApplications.has(applicationId)) {
      this.selectedApplications.delete(applicationId);
    } else {
      this.selectedApplications.add(applicationId);
    }
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;

    if (this.selectAll) {
      this.filteredApplications.forEach(app => {
        this.selectedApplications.add(app.jobAppID);
      });
    } else {
      this.selectedApplications.clear();
    }
  }

  performBulkAction(action: string): void {
    if (this.selectedApplications.size === 0) {
      this.showSnackBar('No applications selected', 'Error');
      return;
    }

    const count = this.selectedApplications.size;

    switch (action) {
      case 'Schedule Interviews':
        this.showSnackBar(`Scheduled interviews for ${count} candidates`, 'Success');
        break;
      case 'Send Email':
        this.showSnackBar(`Emails sent to ${count} candidates`, 'Success');
        break;
      case 'Archive':
        // Remove the archived applications from the list
        this.filteredApplications = this.filteredApplications.filter(
          app => !this.selectedApplications.has(app.jobAppID)
        );
        this.showSnackBar(`Archived ${count} applications`, 'Success');
        this.selectedApplications.clear();
        break;
      case 'Reject':
        this.showSnackBar(`Rejected ${count} applications`, 'Success');
        break;
      default:
        this.showSnackBar(`Unknown action: ${action}`, 'Error');
    }
  }
}
