import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobOffer, JobOfferService } from 'src/app/services/job-offer.service';
import { JobApplicationService } from 'src/app/services/job-application.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-job-offer-list',
  templateUrl: './job-offer-list.component.html',
  styleUrls: ['./job-offer-list.component.css']
})
export class JobOfferListComponent implements OnInit {
  // Job Offers variables
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  paginatedOffers: JobOffer[] = [];
  selectedOffer: JobOffer | null = null;
  applicationForm!: FormGroup;
  appliedOffers: Set<number> = new Set();
  savedJobs: Set<number> = new Set();
  titleFilter: string = '';
  minDate: string = '';
  maxDate: string = '';
  skillsFilter: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  // Search debounce
  searchSubject = new Subject<string>();
  showSavedOnly: boolean = false;
  showWishlistSection: boolean = false;

  // Career AI Modal variables
  aiModalOpen: boolean = false;
  aiInput: string = '';
  aiResponse: string = '';
  isRecording: boolean = false;
  isLoading: boolean = false;
  mediaRecorder: any;
  audioChunks: any[] = [];

  // Groq API Key
  groqApiKey = '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';

  // Services for Advanced Career Section
  services = [
    {
      title: 'Professional CV Review',
      description: 'Get a detailed review of your CV from industry experts with personalized feedback to highlight your strengths and improve weak areas.',
      icon: 'fa-file-text-o',
      price: '$49',
      popular: true
    },
    {
      title: 'Mock Interview Sessions',
      description: 'Practice with real interviewers from top companies in your industry. Includes video recording and detailed feedback report.',
      icon: 'fa-comments-o',
      price: '$79',
      popular: false
    },
    {
      title: 'Career Path Consultation',
      description: 'One-on-one session with a career coach to plan your professional growth and identify opportunities aligned with your goals.',
      icon: 'fa-road',
      price: '$99',
      popular: false
    },
    {
      title: 'LinkedIn Profile Optimization',
      description: 'Expert review and enhancement of your LinkedIn profile to attract recruiters and showcase your professional brand.',
      icon: 'fa-linkedin-square',
      price: '$39',
      popular: false
    },
    {
      title: 'Salary Negotiation Coaching',
      description: 'Learn effective strategies to negotiate better compensation packages with personalized coaching sessions.',
      icon: 'fa-money',
      price: '$69',
      popular: true
    },
    {
      title: 'Personal Branding Workshop',
      description: 'Group workshop to develop your personal brand and stand out in the competitive job market.',
      icon: 'fa-id-card-o',
      price: '$59',
      popular: false
    }
  ];

  constructor(
    private jobOfferService: JobOfferService,
    private jobApplicationService: JobApplicationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchOffers();
    this.loadSavedJobs();

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.applyFilter();
    });
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

  loadSavedJobs(): void {
    const savedJobIds = this.jobOfferService.getSavedJobs();
    this.savedJobs = new Set(savedJobIds);
  }

  toggleSaveJob(offer: JobOffer): void {
    if (!offer.jobOfferId) return;

    if (this.isJobSaved(offer)) {
      this.jobOfferService.unsaveJob(offer.jobOfferId);
      this.savedJobs.delete(offer.jobOfferId);
      this.showSnackBar('Job removed from saved jobs', 'Success');
    } else {
      this.jobOfferService.saveJob(offer);
      this.savedJobs.add(offer.jobOfferId);
      this.showSnackBar('Job saved successfully', 'Success');
    }
  }

  isJobSaved(offer: JobOffer): boolean {
    return offer.jobOfferId ? this.savedJobs.has(offer.jobOfferId) : false;
  }

  isJobExpired(offer: JobOffer): boolean {
    return new Date(offer.date) < new Date();
  }

  toggleSavedJobsFilter(): void {
    this.showSavedOnly = !this.showSavedOnly;
    this.applyFilter();
  }

  toggleWishlistSection(): void {
    this.showWishlistSection = !this.showWishlistSection;
    if (this.showWishlistSection) {
      this.showSavedOnly = true;
      this.applyFilter();
    }
  }

  shareJob(offer: JobOffer): void {
    if (navigator.share) {
      navigator.share({
        title: `Job Opportunity: ${offer.title}`,
        text: `Check out this job opportunity: ${offer.title}. Required skills: ${offer.skills}`,
        url: window.location.href
      })
      .then(() => this.showSnackBar('Job shared successfully', 'Success'))
      .catch((error) => console.error('Error sharing job:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = window.location.href;
      const shareText = `Job Opportunity: ${offer.title}\nRequired skills: ${offer.skills}\n${shareUrl}`;

      // Use the modern Clipboard API if available
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText)
          .then(() => this.showSnackBar('Job details copied to clipboard', 'Success'))
          .catch(err => {
            console.error('Could not copy text: ', err);
            this.showSnackBar('Failed to copy job details', 'Error');
          });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            this.showSnackBar('Job details copied to clipboard', 'Success');
          } else {
            this.showSnackBar('Failed to copy job details', 'Error');
          }
        } catch (err) {
          console.error('Could not copy text: ', err);
          this.showSnackBar('Failed to copy job details', 'Error');
        }

        document.body.removeChild(textArea);
      }
    }
  }

  applyFilter(): void {
    this.filteredOffers = this.jobOffers.filter(offer => {
      const matchesTitle = !this.titleFilter || offer.title.toLowerCase().includes(this.titleFilter.toLowerCase());
      const matchesSkills = !this.skillsFilter || offer.skills.toLowerCase().includes(this.skillsFilter.toLowerCase());
      const matchesMinDate = !this.minDate || new Date(offer.date) >= new Date(this.minDate);
      const matchesMaxDate = !this.maxDate || new Date(offer.date) <= new Date(this.maxDate);
      const matchesSaved = !this.showSavedOnly || (offer.jobOfferId && this.savedJobs.has(offer.jobOfferId));

      // Show expired jobs only if they're saved (in wishlist)
      const isExpired = this.isJobExpired(offer);
      const showExpired = isExpired ? this.showSavedOnly && this.savedJobs.has(offer.jobOfferId!) : true;

      return matchesTitle && matchesSkills && matchesMinDate && matchesMaxDate && matchesSaved && showExpired;
    });
    this.currentPage = 1;
    this.updatePaginatedOffers();
  }

  resetFilters(): void {
    this.titleFilter = '';
    this.minDate = '';
    this.maxDate = '';
    this.skillsFilter = '';
    this.showSavedOnly = false;
    this.filteredOffers = [...this.jobOffers];
    this.updatePaginatedOffers();
  }

  updatePaginatedOffers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedOffers = this.filteredOffers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.itemsPerPage);
  }

  // 🆕 Fix: Add getPageNumbers()
  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOffers();
  }

  showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 3000 });
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

  requestService(serviceName: string): void {
    alert(`Thank you for your interest in ${serviceName}. We will contact you soon!`);
  }

  openAIModal(): void {
    this.aiModalOpen = true;
    this.aiInput = '';
    this.aiResponse = '';
  }

  closeAIModal(): void {
    this.aiModalOpen = false;
  }

  startRecording(): void {
    this.audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording = true;

      this.mediaRecorder.addEventListener('dataavailable', (event: any) => {
        this.audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.sendAudioToWhisper(audioBlob);
        this.isRecording = false;
      });

      setTimeout(() => {
        this.mediaRecorder.stop();
      }, 10000); // 10 seconds max recording
    });
  }

  sendAudioToWhisper(audioBlob: Blob): void {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');

    fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      this.aiInput = data.text;
    })
    .catch(error => {
      console.error('Error transcribing audio:', error);
      this.showSnackBar('Audio transcription failed.', 'Error');
    });
  }

  sendToGroq(): void {
    if (!this.aiInput.trim()) return;
    this.isLoading = true;

    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are an expert career coach specialized in providing professional advice for job seekers. Your expertise includes:\n\n1. CV/Resume Optimization: Providing specific, actionable feedback to improve resumes\n2. Interview Preparation: Offering strategies for common and difficult interview questions\n3. Career Path Planning: Helping users identify growth opportunities and next steps\n4. Job Application Strategy: Advising on how to stand out in applications\n5. Salary Negotiation: Providing tactics for negotiating better compensation\n\nYour responses should be specific, actionable, and tailored to the user's industry when possible. Include examples and avoid generic advice. If the user shares their CV or job description, analyze it thoroughly and provide detailed feedback. If asked about topics unrelated to careers or job searching, politely redirect the conversation to your areas of expertise." },
          { role: "user", content: this.aiInput }
        ],
        temperature: 0.2
      })
    })
    .then(response => response.json())
    .then(data => {
      this.aiResponse = data.choices[0].message.content;
      this.isLoading = false;
    })
    .catch(error => {
      console.error('Error contacting Groq API:', error);
      this.isLoading = false;
      this.showSnackBar('AI Assistant request failed.', 'Error');
    });
  }

  getCompaniesCount(): number {
    // Since we don't have company property, return a fixed number for demo
    return 8; // Fixed number for demonstration
  }

  getSkillsCount(): number {
    // Get unique skills from all job offers
    const uniqueSkills = new Set<string>();
    this.filteredOffers.forEach(offer => {
      if (offer.skills) {
        const skillsArray = offer.skills.split(',').map(skill => skill.trim());
        skillsArray.forEach(skill => {
          if (skill) uniqueSkills.add(skill);
        });
      }
    });
    return uniqueSkills.size || 12; // Return at least 12 if no skills found
  }
}
