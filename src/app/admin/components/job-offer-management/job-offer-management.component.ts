import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobOffer, JobOfferService } from 'src/app/services/job-offer.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-offer-management',
  templateUrl: './job-offer-management.component.html',
  styleUrls: ['./job-offer-management.component.css']
})
export class JobOfferManagementComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  offerForm!: FormGroup;
  editingOffer: JobOffer | null = null;
  selectedImage: File | null = null;

  constructor(
    private jobOfferService: JobOfferService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchOffers();
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
    this.jobOfferService.getAllOffers().subscribe({
      next: (offers) => this.jobOffers = offers,
      error: () => this.showSnackBar('Failed to load job offers.', 'Error')
    });
  }

  onSubmit(): void {
    if (this.offerForm.invalid) return;
  
    const formValues = this.offerForm.value;
    const formData = new FormData();
    formData.append('jobOffer', new Blob([JSON.stringify(formValues)], { type: 'application/json' }));
  
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
  
    if (this.editingOffer) {
      this.jobOfferService.updateOfferWithImage(this.editingOffer.jobOfferId!, formData).subscribe({
        next: () => {
          this.showSnackBar('Offer updated successfully.', 'Success');
          this.fetchOffers();
          this.resetForm();
        },
        error: (err) => {
          if (err.error && err.error.includes('Cannot modify offer')) {
            this.showSnackBar('Cannot modify this offer because applications already exist.', 'Error');
          } else {
            this.showSnackBar('Failed to update offer.', 'Error');
          }
        }
      });
    } else {
      this.jobOfferService.createOfferWithImage(formData).subscribe({
        next: () => {
          this.showSnackBar('Offer created successfully.', 'Success');
          this.fetchOffers();
          this.resetForm();
        },
        error: () => this.showSnackBar('Failed to create offer.', 'Error')
      });
    }
  }

  editOffer(offer: JobOffer): void {
    this.editingOffer = offer;
    this.offerForm.patchValue({
      title: offer.title,
      jobDescription: offer.jobDescription,
      date: offer.date,
      skills: offer.skills
    });
  }

  deleteOffer(id: number): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.jobOfferService.deleteOffer(id).subscribe({
        next: () => {
          this.showSnackBar('Offer deleted successfully.', 'Success');
          this.fetchOffers();
        },
        error: () => this.showSnackBar('Failed to delete offer.', 'Error')
      });
    }
  }

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
    this.selectedImage = event.target.files[0];
  }
}
