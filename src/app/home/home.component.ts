import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger, state, group, keyframes } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    // Fade In animation
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms {{delay}} cubic-bezier(0.25, 1, 0.5, 1)', style({ opacity: 1 }))
      ], { params: { delay: '0ms' } })
    ]),
    
    // Fade In Up animation
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('800ms {{delay}} cubic-bezier(0.25, 1, 0.5, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: '0ms' } })
    ]),
    
    // Stagger Fade In animation for groups
    trigger('staggerFadeIn', [
      transition(':enter', [
        query(':scope > *', [
          style({ opacity: 0, transform: 'translateY(40px)' }),
          stagger(200, [
            animate('800ms {{delay}} cubic-bezier(0.25, 1, 0.5, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ], { params: { delay: '0ms' } })
    ]),
    
    // Grid Stagger animation
    trigger('staggerGrid', [
      transition(':enter', [
        query(':scope > *', [
          style({ opacity: 0, transform: 'scale(0.9) translateY(30px)' }),
          stagger(100, [
            animate('800ms cubic-bezier(0.25, 1, 0.5, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    
    // Parallax background animation
    trigger('parallaxBg', [
      state('initial', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('scrolled', style({
        transform: 'translate3d(0, -{{scrollPercentage}}%, 0) scale(1.1)'
      }), { params: { scrollPercentage: 0 } })
    ]),
    
    // 3D Parallax effect for about section
    trigger('parallax3D', [
      state('initial', style({
        perspective: '1000px'
      })),
      state('scrolled', style({
        perspective: '1000px'
      })),
      transition('* => *', [
        query('.image-wrapper:nth-child(1)', [
          animate('0.1s ease-out', style({ 
            transform: 'translateZ(60px) translate({{mouseX}}px, {{mouseY}}px)' 
          }))
        ], { optional: true }),
        query('.image-wrapper:nth-child(2)', [
          animate('0.1s ease-out', style({ 
            transform: 'translateZ(30px) translate({{mouseX2}}px, {{mouseY2}}px)' 
          }))
        ], { optional: true }),
        query('.image-wrapper:nth-child(3)', [
          animate('0.1s ease-out', style({ 
            transform: 'translate(-50%, -50%) translateZ(0) translate({{mouseX3}}px, {{mouseY3}}px)' 
          }))
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('aboutSection') aboutSection: ElementRef | undefined;
  specialItems: any[] = []; 
  selectedItem: any = null;
  // Parallax state variables
  parallaxState = {
    state: 'initial',
    scrollPercentage: 0,
    mouseX: 0,
    mouseY: 0,
    mouseX2: 0,
    mouseY2: 0,
    mouseX3: 0,
    mouseY3: 0
  };
  
  // Clock variables
  hourRotation = 0;
  minuteRotation = 0;
  secondRotation = 0;
  clockInterval: any;
  
  // Menu items
  menuItems = [
    {
      name: 'Buddha Bowl Végétarien',
      image: 'assets/menu1.jpg',
      price: '8.50',
      description: 'Quinoa, avocat, légumes rôtis et sauce tahini',
      tags: ['Végétarien', 'Sans Gluten', 'Bio'],
      rating: 5,
      reviews: 124,
      badge: 'Populaire'
    },
    {
      name: 'Burger Gourmet',
      image: 'assets/menu2.jpg',
      price: '9.90',
      description: 'Bœuf charolais, fromage affiné, sauce secrète et frites maison',
      tags: ['Viande', 'Fait Maison'],
      rating: 4,
      reviews: 98
    },
    {
      name: 'Risotto aux Champignons',
      image: 'assets/menu3.jpg',
      price: '8.90',
      description: 'Riz arborio, champignons forestiers et parmesan',
      tags: ['Végétarien', 'Sans Gluten'],
      rating: 5,
      reviews: 87
    },
    {
      name: 'Poke Bowl Saumon',
      image: 'assets/menu4.jpg',
      price: '9.50',
      description: 'Riz vinaigré, saumon frais, avocat et légumes croquants',
      tags: ['Poisson', 'Healthy'],
      rating: 4,
      reviews: 92,
      badge: 'Nouveau'
    },
    {
      name: 'Salade Méditerranéenne',
      image: 'assets/menu5.jpg',
      price: '7.90',
      description: 'Mesclun, féta, olives, tomates séchées et vinaigrette maison',
      tags: ['Végétarien', 'Healthy'],
      rating: 4,
      reviews: 76
    },
    {
      name: 'Tiramisu Maison',
      image: 'assets/menu6.jpg',
      price: '4.50',
      description: 'Biscuits café, mascarpone et cacao',
      tags: ['Dessert', 'Fait Maison'],
      rating: 5,
      reviews: 112,
      badge: 'Favori'
    }
  ];
  
  // Opening hours
  openingHours = [
    { name: 'Lundi', hours: '7:30 - 21:00', isClosed: false },
    { name: 'Mardi', hours: '7:30 - 21:00', isClosed: false },
    { name: 'Mercredi', hours: '7:30 - 21:00', isClosed: false },
    { name: 'Jeudi', hours: '7:30 - 21:00', isClosed: false },
    { name: 'Vendredi', hours: '7:30 - 22:00', isClosed: false },
    { name: 'Samedi', hours: '8:00 - 19:00', isClosed: false },
    { name: 'Dimanche', hours: 'Fermé', isClosed: true }
  ];
  
  constructor() { }
  
  ngOnInit(): void {
    // Start the clock
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }
  
  ngAfterViewInit(): void {
    // Initialize any after view init functionality
  }
  
  ngOnDestroy(): void {
    // Clear intervals when component is destroyed
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }
  
  // Update the clock hands rotation
  updateClock(): void {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    this.secondRotation = seconds * 6; // 60 seconds = 360 degrees
    this.minuteRotation = minutes * 6 + (seconds / 10); // 60 minutes = 360 degrees
    this.hourRotation = (hours * 30) + (minutes / 2); // 12 hours = 360 degrees
  }
  
  // Change menu tab
  changeTab(category: string): void {
    // Implementation for filtering menu items by category
    console.log(`Changed to tab: ${category}`);
    // Here you would usually filter menuItems based on category
  }
  
  // Scroll event listener for parallax effects
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Calculate scroll percentage for hero section
    if (scrollPosition <= windowHeight) {
      const percentage = (scrollPosition / windowHeight) * 30;
      this.parallaxState = {
        ...this.parallaxState,
        state: 'scrolled',
        scrollPercentage: percentage
      };
    }
  }
  
  // Mouse move event for 3D parallax in about section
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.aboutSection) return;
    
    const aboutRect = this.aboutSection.nativeElement.getBoundingClientRect();
    const centerX = aboutRect.left + aboutRect.width / 2;
    const centerY = aboutRect.top + aboutRect.height / 2;
    
    // Calculate mouse position relative to center of section
    const mouseX = (event.clientX - centerX) / 30;
    const mouseY = (event.clientY - centerY) / 30;
    
    // Update parallax state with different movement speeds for each layer
    this.parallaxState = {
      ...this.parallaxState,
      mouseX: mouseX,
      mouseY: mouseY,
      mouseX2: mouseX * 0.6,
      mouseY2: mouseY * 0.6,
      mouseX3: mouseX * 0.3,
      mouseY3: mouseY * 0.3
    };
  }
}