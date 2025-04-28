import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobOffer, JobOfferService } from 'src/app/services/job-offer.service';
import { JobApplicationService } from 'src/app/services/job-application.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-offer-list',
  templateUrl: './job-offer-list.component.html',
  styleUrls: ['./job-offer-list.component.css']
})
export class JobOfferListComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  paginatedOffers: JobOffer[] = [];

  selectedOffer: JobOffer | null = null;
  applicationForm!: FormGroup;
  appliedOffers: Set<number> = new Set();

  // Filters
  titleFilter: string = '';
  minDate: string = '';
  maxDate: string = '';
  skillsFilter: string = '';

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private jobOfferService: JobOfferService,
    private jobApplicationService: JobApplicationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchOffers();
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      motivationAttachment: [null, Validators.required],
      cvAttachment: [null, Validators.required]
    });
  }

  fetchOffers(): void {
    this.jobOfferService.getAllOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers;
        this.filteredOffers = [...this.jobOffers];
        this.updatePaginatedOffers();
      },
      error: () => this.showSnackBar('Failed to load job offers.', 'Error')
    });
  }

  selectOffer(offer: JobOffer): void {
    this.selectedOffer = offer;
    this.applicationForm.reset();
  }

  submitApplication(): void {
    if (!this.selectedOffer || this.applicationForm.invalid) return;

    const formData = new FormData();
    formData.append('motivationAttachment', this.applicationForm.get('motivationAttachment')?.value);
    formData.append('cvAttachment', this.applicationForm.get('cvAttachment')?.value);
    formData.append('jobOfferId', this.selectedOffer.jobOfferId!.toString());

    this.jobApplicationService.submitApplication(formData).subscribe({
      next: () => {
        this.showSnackBar('Application submitted successfully.', 'Success');
        this.appliedOffers.add(this.selectedOffer!.jobOfferId!);
        this.selectedOffer = null;
      },
      error: () => this.showSnackBar('Failed to submit application.', 'Error')
    });
  }

  onMotivationFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.applicationForm.patchValue({ motivationAttachment: file });
    } else {
      this.showSnackBar('Only PDF files are allowed for motivation letter.', 'Error');
    }
  }

  onCVFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.applicationForm.patchValue({ cvAttachment: file });
    } else {
      this.showSnackBar('Only PDF files are allowed for CV.', 'Error');
    }
  }

  applyFilter(): void {
    this.filteredOffers = this.jobOffers.filter(offer => {
      const matchesTitle = !this.titleFilter || offer.title.toLowerCase().includes(this.titleFilter.toLowerCase());
      const matchesSkills = !this.skillsFilter || offer.skills.toLowerCase().includes(this.skillsFilter.toLowerCase());
      const matchesMinDate = !this.minDate || new Date(offer.date) >= new Date(this.minDate);
      const matchesMaxDate = !this.maxDate || new Date(offer.date) <= new Date(this.maxDate);

      return matchesTitle && matchesSkills && matchesMinDate && matchesMaxDate;
    });
    this.currentPage = 1;
    this.updatePaginatedOffers();
  }

  resetFilters(): void {
    this.titleFilter = '';
    this.minDate = '';
    this.maxDate = '';
    this.skillsFilter = '';
    this.filteredOffers = [...this.jobOffers];
    this.updatePaginatedOffers();
  }

  updatePaginatedOffers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedOffers = this.filteredOffers.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOffers();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 3000 });
  }
}
