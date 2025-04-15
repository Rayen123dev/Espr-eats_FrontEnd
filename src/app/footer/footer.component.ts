import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = '';
  isSubscribed: boolean = false;
  
  // Social media links
  socialLinks = [
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-twitter', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' },
    { icon: 'fab fa-github', url: '#' }
  ];
  
  // Quick links for navigation
  quickLinks = [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Projects', route: '/projects' },
    { name: 'Reports', route: '/reports' },
    { name: 'About Us', route: '/about' },
    { name: 'Contact', route: '/contact' }
  ];
  
  // Contact information
  contactInfo = [
    { icon: 'fas fa-phone-alt', text: '+1 (234) 567-890', url: 'tel:+1234567890' },
    { icon: 'fas fa-envelope', text: 'info@example.com', url: 'mailto:info@example.com' },
    { icon: 'fas fa-map-marker-alt', text: '123 Street Name, City, Country', url: '#' },
    { icon: 'far fa-clock', text: 'Mon-Fri: 9AM - 5PM', url: '#' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Initialize any footer animations or functionality
    this.initializeParticles();
  }

  subscribeNewsletter() {
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      this.showToast('Please enter a valid email address');
      return;
    }

    this.http.post('api/newsletter/subscribe', { email: this.newsletterEmail })
      .pipe(
        catchError(error => {
          console.error('Newsletter subscription failed', error);
          this.showToast('Subscription failed. Please try again later.');
          return throwError(() => new Error('Subscription failed'));
        })
      )
      .subscribe({
        next: () => {
          this.isSubscribed = true;
          this.newsletterEmail = '';
          
          // Reset the success message after 5 seconds
          setTimeout(() => {
            this.isSubscribed = false;
          }, 5000);
          
          this.showToast('Thank you for subscribing!');
        }
      });
  }
  
  // Validate email format
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }
  
  // Show toast notification (placeholder for implementation)
  showToast(message: string) {
    // This is a placeholder - implement with your preferred toast/notification library
    console.log(message);
    // Example implementation if you have a toast service:
    // this.toastService.show(message, { classname: 'bg-success text-light', delay: 3000 });
  }
  
  // Initialize decorative particle animations
  private initializeParticles() {
    // This would contain the logic for animating the background particles
    // You could use CSS animations or implement more complex animations with JS
    
    // Example: randomly position particles
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      (particle as HTMLElement).style.left = `${randomX}%`;
      (particle as HTMLElement).style.top = `${randomY}%`;
    });
  }
}