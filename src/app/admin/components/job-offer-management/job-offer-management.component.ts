import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobOffer, JobOfferService } from 'src/app/services/job-offer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobApplicationService } from 'src/app/services/job-application.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-job-offer-management',
  templateUrl: './job-offer-management.component.html',
  styleUrls: ['./job-offer-management.component.css']
})
export class JobOfferManagementComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  offerForm!: FormGroup;
  editingOffer: JobOffer | null = null;
  selectedImage: File | null = null;

  // New properties
  isLoading: boolean = false;
  showForm: boolean = false;
  viewMode: 'table' | 'card' = 'table';
  searchKeyword: string = '';
  sortField: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  statusFilter: 'all' | 'active' | 'expired' = 'all';
  imagePreviewUrl: string | null = null;

  // Modal properties
  showDeleteModal: boolean = false;
  offerToDelete: JobOffer | null = null;
  showDescriptionModal: boolean = false;
  selectedOffer: JobOffer | null = null;

  // AI Job Description Generator
  showAiGeneratorModal: boolean = false;
  aiGeneratorForm!: FormGroup;
  generatedDescription: string = '';
  isGeneratingDescription: boolean = false;

  // Job Analytics
  showAnalyticsModal: boolean = false;
  selectedOfferAnalytics: any = null;
  analyticsLoading: boolean = false;

  // Application count
  applicationCounts: Map<number, number> = new Map();

  constructor(
    private jobOfferService: JobOfferService,
    private jobApplicationService: JobApplicationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initAiGeneratorForm();
    this.fetchOffers();
    this.fetchApplicationCounts();
  }

  initAiGeneratorForm(): void {
    this.aiGeneratorForm = this.fb.group({
      jobTitle: ['', Validators.required],
      industry: ['', Validators.required],
      experienceLevel: ['mid-level', Validators.required],
      keySkills: ['', Validators.required],
      companyDescription: [''],
      tone: ['professional']
    });
  }

  toggleFormVisibility(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  getActiveOffers(): number {
    return this.jobOffers.filter(offer => !this.isExpired(offer.date)).length;
  }

  getExpiredOffers(): number {
    return this.jobOffers.filter(offer => this.isExpired(offer.date)).length;
  }

  getApplicationsCount(): number {
    return Array.from(this.applicationCounts.values()).reduce((sum, count) => sum + count, 0);
  }

  isExpired(date: Date | undefined): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  fetchApplicationCounts(): void {
    this.jobApplicationService.getAllApplications().subscribe({
      next: (applications) => {
        // Group applications by job offer ID
        applications.forEach((app: any) => {
          if (app.jobOfferId) {
            const currentCount = this.applicationCounts.get(app.jobOfferId) || 0;
            this.applicationCounts.set(app.jobOfferId, currentCount + 1);
          }
        });
      },
      error: () => console.error('Failed to fetch application counts')
    });
  }

  initForm(): void {
    this.offerForm = this.fb.group({
      title: ['', Validators.required],
      jobDescription: ['', Validators.required],
      date: ['', [Validators.required, this.futureDateValidator]],
      skills: ['', Validators.required]
    });
  }

  fetchOffers(): void {
    this.isLoading = true;
    this.jobOfferService.getAllOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers;
        this.filteredOffers = [...offers];
        this.sortOffers();
        this.isLoading = false;
      },
      error: () => {
        this.showSnackBar('Failed to load job offers.', 'Error');
        this.isLoading = false;
      }
    });
  }

  searchOffers(): void {
    if (!this.searchKeyword.trim() && this.statusFilter === 'all') {
      this.filteredOffers = [...this.jobOffers];
      return;
    }

    const keyword = this.searchKeyword.toLowerCase().trim();

    this.filteredOffers = this.jobOffers.filter(offer => {
      const matchesKeyword = !keyword ||
        offer.title.toLowerCase().includes(keyword) ||
        offer.jobDescription.toLowerCase().includes(keyword) ||
        offer.skills.toLowerCase().includes(keyword);

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && !this.isExpired(offer.date)) ||
        (this.statusFilter === 'expired' && this.isExpired(offer.date));

      return matchesKeyword && matchesStatus;
    });

    this.sortOffers();
  }

  sortOffers(): void {
    this.filteredOffers.sort((a, b) => {
      let comparison = 0;

      switch (this.sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'skills':
          comparison = a.skills.localeCompare(b.skills);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortOffers();
  }

  filterByStatus(status: 'all' | 'active' | 'expired'): void {
    this.statusFilter = status;
    this.searchOffers();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.statusFilter = 'all';
    this.filteredOffers = [...this.jobOffers];
    this.sortOffers();
  }

  onSubmit(): void {
    if (this.offerForm.invalid) return;

    const formValues = this.offerForm.value;

    // Create a complete job offer object with all required fields
    const jobOfferData = {
      title: formValues.title,
      jobDescription: formValues.jobDescription,
      date: formValues.date,
      skills: formValues.skills,
      jobType: formValues.jobType || 'Full-time',
      location: formValues.location || 'Remote',
      salary: formValues.salary || ''
    };

    const formData = new FormData();
    formData.append('jobOffer', new Blob([JSON.stringify(jobOfferData)], { type: 'application/json' }));

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.editingOffer) {
      // For update, make sure we have the ID
      if (!this.editingOffer.jobOfferId) {
        this.showSnackBar('Error: Missing job offer ID', 'Error');
        return;
      }

      this.jobOfferService.updateOfferWithImage(this.editingOffer.jobOfferId, formData).subscribe({
        next: () => {
          this.showSnackBar('Offer updated successfully.', 'Success');
          this.fetchOffers();
          this.resetForm();
          this.toggleFormVisibility(); // Hide the form after successful update
        },
        error: (err) => {
          console.error('Update error:', err);
          if (err.error && typeof err.error === 'string' && err.error.includes('Cannot modify offer')) {
            this.showSnackBar('Cannot modify this offer because applications already exist.', 'Error');
          } else {
            this.showSnackBar('Failed to update offer. Please try again.', 'Error');
          }
        }
      });
    } else {
      this.jobOfferService.createOfferWithImage(formData).subscribe({
        next: () => {
          this.showSnackBar('Offer created successfully.', 'Success');
          this.fetchOffers();
          this.resetForm();
          this.toggleFormVisibility(); // Hide the form after successful creation
        },
        error: (err) => {
          console.error('Create error:', err);
          this.showSnackBar('Failed to create offer. Please try again.', 'Error');
        }
      });
    }
  }

  editOffer(offer: JobOffer): void {
    this.editingOffer = offer;

    // Make sure the form is visible
    if (!this.showForm) {
      this.toggleFormVisibility();
    }

    // Populate the form with the offer data
    this.offerForm.patchValue({
      title: offer.title,
      jobDescription: offer.jobDescription,
      date: offer.date,
      skills: offer.skills,
      jobType: offer.jobType || 'Full-time',
      location: offer.location || 'Remote',
      salary: offer.salary || ''
    });

    // If there's an image, show it in the preview
    if (offer.image) {
      this.imagePreviewUrl = offer.image;
    }

    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // This method is replaced by the confirmDelete and deleteOffer methods

  resetForm(): void {
    this.editingOffer = null;
    this.offerForm.reset();
    this.selectedImage = null;
  }

  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 3000 });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getSelectedFileName(): string {
    return this.selectedImage ? this.selectedImage.name : 'No file selected';
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
  }

  getDescriptionPreview(description: string): string {
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  getSkillsArray(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }

  viewFullDescription(offer: JobOffer): void {
    this.selectedOffer = offer;
    this.showDescriptionModal = true;
  }

  closeDescriptionModal(): void {
    this.showDescriptionModal = false;
    this.selectedOffer = null;
  }

  confirmDelete(offer: JobOffer): void {
    this.offerToDelete = offer;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.offerToDelete = null;
  }

  deleteOffer(): void {
    if (!this.offerToDelete || !this.offerToDelete.jobOfferId) return;

    this.jobOfferService.deleteOffer(this.offerToDelete.jobOfferId).subscribe({
      next: () => {
        this.showSnackBar('Offer deleted successfully.', 'Success');
        this.fetchOffers();
        this.cancelDelete();
      },
      error: () => {
        this.showSnackBar('Failed to delete offer.', 'Error');
        this.cancelDelete();
      }
    });
  }

  viewApplications(offer: JobOffer): void {
    if (!offer.jobOfferId) return;

    // Navigate to applications page with filter for this job
    this.router.navigate(['/admin-layout/job-application-management'], {
      queryParams: { jobOfferId: offer.jobOfferId }
    });
  }

  // AI Job Description Generator Methods
  openAiGenerator(): void {
    this.showAiGeneratorModal = true;
    this.generatedDescription = '';
  }

  closeAiGenerator(): void {
    this.showAiGeneratorModal = false;
    this.aiGeneratorForm.reset({
      experienceLevel: 'mid-level',
      tone: 'professional'
    });
    this.generatedDescription = '';
  }

  generateJobDescription(): void {
    if (this.aiGeneratorForm.invalid) {
      this.showSnackBar('Please fill all required fields', 'Error');
      return;
    }

    this.isGeneratingDescription = true;

    // In a real implementation, this would call an AI service API
    // Here we're simulating the AI generation with a timeout
    setTimeout(() => {
      const formValues = this.aiGeneratorForm.value;
      this.generatedDescription = this.simulateAiJobDescriptionGeneration(formValues);
      this.isGeneratingDescription = false;
    }, 2000);
  }

  simulateAiJobDescriptionGeneration(formValues: any): string {
    const { jobTitle, industry, experienceLevel, keySkills, companyDescription, tone } = formValues;

    // Split skills into array
    const skills = keySkills.split(',').map((skill: string) => skill.trim());

    // Generate company intro
    let description = '';
    if (companyDescription) {
      description += `${companyDescription}\n\n`;
    } else {
      description += `We are a leading company in the ${industry} industry, looking for talented professionals to join our team.\n\n`;
    }

    // Generate job title and intro
    let levelText = '';
    switch (experienceLevel) {
      case 'entry-level':
        levelText = 'an entry-level';
        break;
      case 'mid-level':
        levelText = 'a mid-level';
        break;
      case 'senior':
        levelText = 'a senior';
        break;
      case 'lead':
        levelText = 'a lead';
        break;
      default:
        levelText = 'a';
    }

    description += `# ${jobTitle}\n\n`;

    // Add intro based on tone
    if (tone === 'professional') {
      description += `We are currently seeking ${levelText} ${jobTitle} to join our team. The ideal candidate will have a strong background in ${industry} and expertise in ${skills.slice(0, 3).join(', ')}.\n\n`;
    } else if (tone === 'casual') {
      description += `Hey there! We're looking for ${levelText} ${jobTitle} to become part of our awesome team. If you love ${industry} and are great with ${skills.slice(0, 3).join(', ')}, we want to hear from you!\n\n`;
    } else if (tone === 'enthusiastic') {
      description += `Exciting opportunity alert! We're searching for ${levelText} passionate ${jobTitle} to join our innovative team! If you're enthusiastic about ${industry} and excel in ${skills.slice(0, 3).join(', ')}, this is your chance to shine!\n\n`;
    }

    // Add responsibilities section
    description += `## Responsibilities:\n\n`;

    // Generate random responsibilities based on job title and skills
    const responsibilities = this.generateResponsibilities(jobTitle, skills, industry);
    responsibilities.forEach(responsibility => {
      description += `- ${responsibility}\n`;
    });

    description += `\n## Requirements:\n\n`;

    // Add requirements based on skills and experience level
    const requirements = this.generateRequirements(skills, experienceLevel, industry);
    requirements.forEach(requirement => {
      description += `- ${requirement}\n`;
    });

    description += `\n## Benefits:\n\n`;

    // Add standard benefits
    const benefits = [
      'Competitive salary and performance bonuses',
      'Health, dental, and vision insurance',
      'Flexible working hours and remote work options',
      'Professional development opportunities',
      'Collaborative and innovative work environment',
      'Paid time off and holidays'
    ];

    benefits.forEach(benefit => {
      description += `- ${benefit}\n`;
    });

    return description;
  }

  generateResponsibilities(jobTitle: string, skills: string[], industry: string): string[] {
    // This would be more sophisticated in a real AI implementation
    const baseResponsibilities = [
      `Design and implement solutions using ${skills[0]} and ${skills[1]}`,
      `Collaborate with cross-functional teams to define, design, and ship new features`,
      `Ensure the performance, quality, and responsiveness of applications`,
      `Identify and correct bottlenecks and fix bugs`,
      `Help maintain code quality, organization, and automatization`
    ];

    // Add job-specific responsibilities
    if (jobTitle.toLowerCase().includes('developer') || jobTitle.toLowerCase().includes('engineer')) {
      baseResponsibilities.push(
        `Write clean, maintainable code and perform peer code reviews`,
        `Participate in the entire application lifecycle, focusing on coding and debugging`,
        `Develop technical specifications and architecture`
      );
    } else if (jobTitle.toLowerCase().includes('designer')) {
      baseResponsibilities.push(
        `Create user-centered designs by understanding business requirements`,
        `Create wireframes, prototypes, and user flows`,
        `Conduct user research and evaluate user feedback`
      );
    } else if (jobTitle.toLowerCase().includes('manager')) {
      baseResponsibilities.push(
        `Lead and mentor a team of professionals`,
        `Manage project timelines, resources, and scope`,
        `Report on project status to stakeholders`
      );
    }

    // Add industry-specific responsibilities
    if (industry.toLowerCase().includes('tech') || industry.toLowerCase().includes('software')) {
      baseResponsibilities.push(
        `Stay up-to-date with emerging technologies and industry trends`,
        `Participate in continuous improvement by researching and implementing new technologies`
      );
    } else if (industry.toLowerCase().includes('finance') || industry.toLowerCase().includes('banking')) {
      baseResponsibilities.push(
        `Ensure compliance with financial regulations and security standards`,
        `Develop solutions that meet strict security and performance requirements`
      );
    } else if (industry.toLowerCase().includes('healthcare')) {
      baseResponsibilities.push(
        `Ensure compliance with healthcare regulations (HIPAA, etc.)`,
        `Develop solutions that improve patient care and operational efficiency`
      );
    }

    return baseResponsibilities;
  }

  generateRequirements(skills: string[], experienceLevel: string, industry: string): string[] {
    let yearsOfExperience = '1+';
    switch (experienceLevel) {
      case 'entry-level':
        yearsOfExperience = '0-2';
        break;
      case 'mid-level':
        yearsOfExperience = '3-5';
        break;
      case 'senior':
        yearsOfExperience = '5-8';
        break;
      case 'lead':
        yearsOfExperience = '8+';
        break;
    }

    const baseRequirements = [
      `${yearsOfExperience} years of experience in ${industry}`,
      `Proficiency in ${skills.join(', ')}`,
      `Strong problem-solving abilities and attention to detail`,
      `Excellent communication and teamwork skills`
    ];

    // Add experience level specific requirements
    if (experienceLevel === 'senior' || experienceLevel === 'lead') {
      baseRequirements.push(
        `Experience leading projects and mentoring junior team members`,
        `Ability to architect solutions and make high-level technical decisions`
      );
    }

    // Add education requirement
    baseRequirements.push(`Bachelor's degree in a relevant field or equivalent practical experience`);

    return baseRequirements;
  }

  useGeneratedDescription(): void {
    if (!this.generatedDescription) {
      this.showSnackBar('No description has been generated yet', 'Error');
      return;
    }

    // Apply the generated description to the job offer form
    this.offerForm.patchValue({
      jobDescription: this.generatedDescription
    });

    // If the job title field is empty, also fill it from the AI generator
    if (!this.offerForm.get('title')?.value && this.aiGeneratorForm.get('jobTitle')?.value) {
      this.offerForm.patchValue({
        title: this.aiGeneratorForm.get('jobTitle')?.value
      });
    }

    // If the skills field is empty, also fill it from the AI generator
    if (!this.offerForm.get('skills')?.value && this.aiGeneratorForm.get('keySkills')?.value) {
      this.offerForm.patchValue({
        skills: this.aiGeneratorForm.get('keySkills')?.value
      });
    }

    this.closeAiGenerator();
    this.showSnackBar('Description applied to the job offer form', 'Success');

    // Make sure the form is visible
    if (!this.showForm) {
      this.toggleFormVisibility();
    }
  }

  // Job Analytics Methods
  viewJobAnalytics(offer: JobOffer): void {
    this.selectedOfferAnalytics = {
      jobOffer: offer,
      applicationsCount: this.applicationCounts.get(offer.jobOfferId!) || 0,
      viewsCount: Math.floor(Math.random() * 1000) + 100, // Simulated data
      clickRate: (Math.random() * 20 + 5).toFixed(1) + '%', // Simulated data
      conversionRate: (Math.random() * 10 + 1).toFixed(1) + '%', // Simulated data
      averageTimeToHire: Math.floor(Math.random() * 30) + 10, // Simulated data
      topSourceChannels: [
        { name: 'LinkedIn', percentage: Math.floor(Math.random() * 40) + 20 },
        { name: 'Indeed', percentage: Math.floor(Math.random() * 30) + 10 },
        { name: 'Company Website', percentage: Math.floor(Math.random() * 20) + 5 },
        { name: 'Referrals', percentage: Math.floor(Math.random() * 15) + 5 }
      ],
      candidateDemographics: {
        experience: [
          { level: 'Entry Level', percentage: Math.floor(Math.random() * 30) + 10 },
          { level: 'Mid Level', percentage: Math.floor(Math.random() * 40) + 20 },
          { level: 'Senior Level', percentage: Math.floor(Math.random() * 30) + 10 }
        ],
        skills: this.getSkillsArray(offer.skills).map(skill => ({
          name: skill,
          matchPercentage: Math.floor(Math.random() * 50) + 50
        }))
      }
    };

    this.showAnalyticsModal = true;
  }

  closeAnalyticsModal(): void {
    this.showAnalyticsModal = false;
    this.selectedOfferAnalytics = null;
  }


}
