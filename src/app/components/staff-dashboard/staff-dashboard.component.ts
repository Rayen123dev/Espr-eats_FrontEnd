import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { PlatService } from '../../services/plat.service';
import { RegimeService } from '../../services/regime.service';
import { LoginService } from '../../login.service';
import { Menu } from '../../../core/models/menu.model';
import { Plat, CategoriePlat } from '../../../core/models/plat.model';
import { RegimeAlimentaire, RegimeAlimentaireType } from '../../../core/models/regime.model';
import { ChartData, ChartOptions } from 'chart.js';
import { startOfWeek, endOfWeek, subWeeks, format, eachWeekOfInterval } from 'date-fns';
import { PdfGeneratorService } from 'src/app/pdf-generator.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-staff-dashboard',
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent implements OnInit {
  totalPlats: number = 0;
  totalCategories: number = 0;
  totalMenus: number = 0;
  totalValidatedMenus: number = 0;
  totalRegimes: number = 0;
  regimeTypes: number = 0;
  validationRate: number = 0;
  validatedMenus: number = 0;
 // Pagination pour les plats (5 plats par page)
 itemsPerPage: number = 5; // Fixé à 5 plats par page
 currentPage: number = 1;
 totalPages: number = 1;
  

  plats: Plat[] = [];
  displayedPlats: Plat[] = []; // Plats affichés sur la page courante
  regimes: RegimeAlimentaire[] = [];
  menus: Menu[] = [];

  userId: number | null = null;
  userRole: string | null = null;

  showAddPlatForm: boolean = false;
  addPlatForm: FormGroup;
  categories = Object.values(CategoriePlat);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isEditMode: boolean = false;
  currentPlatId: number | null = null;
  showAssignPlatsModal: boolean = false;
  selectedRegime: RegimeAlimentaire | null = null;
  selectedPlatIds: number[] = [];
  selectedRegimeId: number | null = null;
  notificationMessage: string = '';  // Message à afficher dans la bannière
  notificationType: 'success' | 'error' | null = null;  // Type de notification


  // Ajout pour le formulaire de régime
  showAddRegimeForm: boolean = false; // Contrôle l'affichage du formulaire
  addRegimeForm: FormGroup; // Formulaire pour ajouter un régime
  regimeTypesList = Object.values(RegimeAlimentaireType); // Liste des types de régime pour le select

  // Données pour le graphique "Répartition des plats par catégorie" (Histogramme)
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Catégorie'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Nombre de plats'
        },
        beginAtZero: true
      }
    }
  };
  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Nombre de plats',
        backgroundColor: ['#000000', '#B91C1C', '#F97316', '#6B7280', '#EF4444', '#9CA3AF'],
        borderColor: ['#000000', '#B91C1C', '#F97316', '#6B7280', '#EF4444', '#9CA3AF'],
        borderWidth: 1
      }
      
    ]
  };

  // Données pour le graphique "Menus par semaine" (Graphique linéaire)
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Semaine'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Nombre de menus'
        },
        beginAtZero: true
      }
    }
  };
  public lineChartType: 'line' = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Menus validés',
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        data: [],
        label: 'Menus en attente',
        borderColor: '#45B7D1',
        backgroundColor: 'rgba(69, 183, 209, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  constructor(
    private menuService: MenuService,
    private platService: PlatService,
    private regimeService: RegimeService,
    private loginService: LoginService,
    private pdfGenerator: PdfGeneratorService,
    private fb: FormBuilder,
    private route: ActivatedRoute // Add ActivatedRoute
  ) {
    // Formulaire pour ajouter un plat
    this.addPlatForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      categorie: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
    });

    // Formulaire pour ajouter un régime
    this.addRegimeForm = this.fb.group({
      type: ['', Validators.required] // Champ pour le type de régime
    });
  }

  ngOnInit(): void {
    this.initializeUser();
    this.loadStats();
    this.loadPlats();
    this.loadRegimes();
    this.loadMenus();
  
    this.route.queryParams.subscribe(params => {
      const name = params['name'];
      const calories = params['calories'];
      const imagePath = 'assets/images/' + params['imagePath'];
  
      if (name && calories && params['imagePath']) {
        fetch(imagePath)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], params['imagePath'], { type: blob.type });
            this.selectedFile = file;
  
            this.addPlatForm.patchValue({
              nom: name,
              description: '',
              categorie: '',
              calories: parseInt(calories, 10),
              image: this.selectedFile
            });
  
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
  
            const fakeInput = document.createElement('input');
            fakeInput.type = 'file';
            fakeInput.files = dataTransfer.files;
  
            const event = { target: fakeInput } as unknown as Event;
            this.onFileSelected(event);
  
            // Set imagePreview from FileReader
            const reader = new FileReader();
            reader.onload = () => {
              this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
  
            this.showAddPlatForm = true;
          });
      }
    });
  }
  
    
  

  private initializeUser(): void {
    this.userId = this.loginService.getUserIdFromToken();
    this.userRole = this.loginService.getRole();
    if (this.userId === null || this.userRole === null) {
      console.error('Aucun utilisateur connecté ou token invalide');
    }
  }

  toggleRegime(regimeId: number): void {
    this.selectedRegimeId = this.selectedRegimeId === regimeId ? null : regimeId;
  }
  // Méthodes ajoutées pour la notification
  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => this.clearNotification(), 5000);
  }

  clearNotification(): void {
    this.notificationMessage = '';
    this.notificationType = null;
  }


  loadStats(): void {
    if (this.userId === null) return;
    this.platService.getAllPlats().subscribe(plats => {
      this.plats = plats;
      this.totalPlats = plats.length;
      this.totalCategories = new Set(plats.map(plat => plat.categorie)).size;
      this.updatePagination();
      this.updateBarChartData();
    });

    this.menuService.getAllMenus(this.userId).subscribe(menus => {
      this.menus = menus;
      this.totalMenus = menus.length;
      this.totalValidatedMenus = menus.filter(menu => menu.isValidated).length;
      this.validatedMenus = this.totalValidatedMenus;
      this.validationRate = this.totalMenus > 0 ? Math.round((this.totalValidatedMenus / this.totalMenus) * 100) : 0;
      this.updateLineChartData();
      console.log('Menus:', menus);
      console.log('Menus validés:', this.totalValidatedMenus);
      console.log('Taux de validation:', this.validationRate);
    });

    this.regimeService.getAllRegimes().subscribe(regimes => {
      this.regimes = regimes;
      this.totalRegimes = regimes.length;
      this.regimeTypes = new Set(regimes.map(regime => regime.type)).size;
      
    });
  }

// Méthode de pagination
updatePagination(): void {
  this.totalPages = Math.ceil(this.plats.length / this.itemsPerPage);
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.displayedPlats = this.plats.slice(startIndex, endIndex);
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePagination();
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePagination();
  }
}

  loadPlats(): void {
    this.platService.getAllPlats().subscribe(plats => {
      this.plats = plats;
      this.updatePagination();
    });
  }

  loadRegimes(): void {
    this.regimeService.getAllRegimes().subscribe(regimes => {
      this.regimes = regimes;
    });
  }

  loadMenus(): void {
    if (this.userId === null) return;
    this.menuService.getAllMenus(this.userId).subscribe(menus => {
      this.menus = menus;
    });
  }

  updateBarChartData(): void {
    const categories = Object.values(CategoriePlat);
    const data = categories.map(category => 
      this.plats.filter(plat => plat.categorie === category).length
    );

    this.barChartData.labels = categories;
    this.barChartData.datasets[0].data = data;
  }

  updateLineChartData(): void {
    const NUMBER_OF_WEEKS = 6;
    const today = new Date();
    const startDate = subWeeks(today, NUMBER_OF_WEEKS - 1);

    const weeks = eachWeekOfInterval({ start: startDate, end: today }, { weekStartsOn: 1 });
    const weekLabels = weeks.map(week => `Semaine du ${format(week, 'dd/MM/yyyy')}`);

    const validatedData: number[] = new Array(weeks.length).fill(0);
    const pendingData: number[] = new Array(weeks.length).fill(0);

    this.menus.forEach(menu => {
      const menuDate = new Date(menu.date);
      if (menuDate >= startDate && menuDate <= today) {
        weeks.forEach((week, index) => {
          const weekStart = startOfWeek(week, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
          if (menuDate >= weekStart && menuDate <= weekEnd) {
            if (menu.isValidated) {
              validatedData[index]++;
            } else {
              pendingData[index]++;
            }
          }
        });
      }
    });

    this.lineChartData.labels = weekLabels;
    this.lineChartData.datasets[0].data = validatedData;
    this.lineChartData.datasets[1].data = pendingData;
  }

  toggleAddPlatForm(): void {
    this.showAddPlatForm = !this.showAddPlatForm;
    if (!this.showAddPlatForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.addPlatForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.isEditMode = false;
    this.currentPlatId = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

 // Méthode modifiée pour soumettre un plat
 submitPlat(): void {
  if (this.addPlatForm.valid && this.userId !== null) {
    const nomPlat = this.addPlatForm.get('nom')?.value.trim().toLowerCase();
    const platExiste = this.plats.some(plat => 
      plat.nom.trim().toLowerCase() === nomPlat && 
      (!this.isEditMode || plat.id !== this.currentPlatId)
    );

    if (platExiste) {
      this.showNotification('Un plat avec ce nom existe déjà. Veuillez choisir un autre nom.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.addPlatForm.get('nom')?.value || '');
    formData.append('description', this.addPlatForm.get('description')?.value || '');
    formData.append('categorie', this.addPlatForm.get('categorie')?.value || '');
    formData.append('calories', this.addPlatForm.get('calories')?.value.toString() || '0');
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    formData.append('userId', this.userId.toString());

    if (this.isEditMode && this.currentPlatId) {
      this.platService.updatePlatWithImage(this.currentPlatId, this.userId, formData).subscribe({
        next: (response) => {
          this.loadPlats();
          this.loadStats();
          this.toggleAddPlatForm();
          this.showNotification('Plat modifié avec succès.', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de la modification du plat:', err);
          this.showNotification('Une erreur est survenue lors de la modification du plat.', 'error');
        }
      });
    } else {
      this.platService.addPlatWithImage(formData, this.userId).subscribe({
        next: (response) => {
          this.loadPlats();
          this.loadStats();
          this.toggleAddPlatForm();
          this.showNotification('Plat ajouté avec succès.', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du plat:', err);
          this.showNotification('Une erreur est survenue lors de l\'ajout du plat.', 'error');
        }
      });
    }
  }
}

// Modifier la méthode getImageUrl pour utiliser directement l'URL Cloudinary
getImageUrl(filename: string): string {
  if (!filename) {
    return '/assets/default-avatar.png';
  }
  // Si l'URL est déjà une URL Cloudinary complète, la retourner directement
  if (filename.startsWith('http')) {
    return filename;
  }
  // Sinon, retourner l'image par défaut
  return '/assets/default-avatar.png';
}

openEditPlatModal(plat: Plat): void {
  this.isEditMode = true;
  this.currentPlatId = plat.id;
  this.showAddPlatForm = true;

  this.addPlatForm.patchValue({
    nom: plat.nom,
    description: plat.description,
    categorie: plat.categorie,
    calories: plat.calories
  });

  if (plat.imagePath) {
    this.imagePreview = plat.imagePath;
  }

  // Ajout d'une notification pour informer l'utilisateur
  this.showNotification(`Mode édition activé pour le plat "${plat.nom}".`, 'success');
}

  deletePlat(platId: number): void {
    if (this.userId === null) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      this.platService.deletePlat(platId, this.userId).subscribe({
        next: () => {
          this.loadPlats();
          this.loadStats();
          this.showNotification('Plat supprimé avec succès.', 'success'); // Notification de succès
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du plat:', err);
          this.showNotification('Une erreur est survenue lors de la suppression du plat.', 'error'); // Notification d'erreur
        }
      });
    }
  }

  // Méthodes pour le formulaire d'ajout de régime
  toggleAddRegimeForm(): void {
    this.showAddRegimeForm = !this.showAddRegimeForm;
    if (!this.showAddRegimeForm) {
      this.addRegimeForm.reset(); // Réinitialiser le formulaire lorsqu'il est fermé
    }
  }

  // Méthode modifiée pour soumettre un régime
  submitRegime(): void {
    if (!this.addRegimeForm.valid) {
      this.showNotification('Veuillez remplir tous les champs requis.', 'error');
      return;
    }

    if (this.userId === null) {
      this.showNotification('Utilisateur non connecté. Veuillez vous reconnecter.', 'error');
      return;
    }

    const typeValue = this.addRegimeForm.get('type')?.value;
    if (!typeValue || !Object.values(RegimeAlimentaireType).includes(typeValue)) {
      this.showNotification('Type de régime invalide. Veuillez sélectionner un type valide.', 'error');
      return;
    }

    const regimeExiste = this.regimes.some(regime => 
      regime.type === typeValue
    );

    if (regimeExiste) {
      this.showNotification('Un régime de ce type existe déjà. Veuillez choisir un autre type.', 'error');
      return;
    }

    const newRegime: RegimeAlimentaire = {
      id: Number(this.addRegimeForm.get('id')?.value),
      type: typeValue as RegimeAlimentaireType,
      platsRecommandes: []
    };

    this.regimeService.addRegime(newRegime, this.userId).subscribe({
      next: (response) => {
        console.log('Régime ajouté avec succès:', response);
        this.loadRegimes();
        this.loadStats();
        this.toggleAddRegimeForm();
        this.showNotification('Régime ajouté avec succès.', 'success');
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du régime:', err);
        this.showNotification('Une erreur est survenue lors de l\'ajout du régime: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  deleteRegime(regimeId: number): void {
    if (this.userId === null) {
      this.showNotification('Utilisateur non connecté. Veuillez vous reconnecter.', 'error');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce régime ?')) {
      this.regimeService.deleteRegime(regimeId, this.userId).subscribe({
        next: () => {
          this.loadRegimes();
          this.loadStats();
          this.showNotification('Régime supprimé avec succès.', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du régime:', err);
          if (err.status === 403) {
            this.showNotification('Vous n\'avez pas les permissions nécessaires pour supprimer un régime.', 'error');
          } else if (err.status === 404) {
            this.showNotification('Régime non trouvé.', 'error');
          } else {
            this.showNotification('Une erreur est survenue lors de la suppression du régime: ' + err.message, 'error');
          }
        }
      });
    }
  }

  openEditRegimeModal(regime: RegimeAlimentaire): void {
    if (this.userId === null) return;
    const updatedRegime: RegimeAlimentaire = {
      ...regime,
      type: prompt('Nouveau type de régime (NORMAL, DIABETIQUE, SPORTIF, VEGETARIEN) :', regime.type) as RegimeAlimentaireType || regime.type
    };
    this.regimeService.updateRegime(regime.id, this.userId, updatedRegime).subscribe({
      next: () => {
        this.loadRegimes();
        this.loadStats();
        this.showNotification(`Régime "${regime.type}" modifié avec succès.`, 'success'); // Notification de succès
      },
      error: (err) => {
        console.error('Erreur lors de la modification du régime:', err);
        this.showNotification('Une erreur est survenue lors de la modification du régime.', 'error'); // Notification d'erreur
      }
    });
  }

  openAssignPlatsModal(regime: RegimeAlimentaire): void {
    this.selectedRegime = regime;
    this.selectedPlatIds = [...regime.platsRecommandes.map(p => p.id)];
    console.log('Plats pré-sélectionnés pour', regime.type, ':', this.selectedPlatIds);
    this.showAssignPlatsModal = true;
  }

  closeAssignPlatsModal(event?: Event): void {
    if (event?.target === event?.currentTarget || !event) {
      this.showAssignPlatsModal = false;
      this.selectedRegime = null;
      this.selectedPlatIds = [];
    }
  }

  togglePlatSelection(platId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedPlatIds.push(platId);
    } else {
      this.selectedPlatIds = this.selectedPlatIds.filter(id => id !== platId);
    }
  }

  submitPlatAssignment(): void {
    if (this.selectedRegime && this.selectedPlatIds.length > 0 && this.userId !== null) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.showNotification('Vous devez être connecté pour assigner des plats. Veuillez vous reconnecter.', 'error');
        return;
      }
      console.log('Assignation - regimeId:', this.selectedRegime.id, 'platIds:', this.selectedPlatIds);
      this.regimeService.assignPlatsToRegime(this.selectedRegime.id, this.selectedPlatIds, this.userId).subscribe({
        next: (response) => {
          console.log('Réponse du serveur :', response);
          this.loadRegimes();
          this.loadStats();
          this.closeAssignPlatsModal();
          this.showNotification(response.message, 'success');
        },
        error: (err) => {
          console.error('Erreur lors de l\'assignation des plats :', err);
          if (err.status === 403) {
            this.showNotification('Vous n\'avez pas les permissions nécessaires pour assigner des plats.', 'error');
          } else if (err.status === 0) {
            this.showNotification('Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
          } else {
            this.showNotification('Une erreur est survenue : ' + err.message, 'error');
          }
        }
      });
    } else {
      this.showNotification('Veuillez sélectionner au moins un plat ou vérifier votre connexion.', 'error');
    }
  }

  unassignPlatFromRegime(regimeId: number, platId: number): void {
    if (this.userId === null) {
      this.showNotification('Utilisateur non connecté. Veuillez vous reconnecter.', 'error');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir désassigner ce plat de ce régime ?')) {
      this.regimeService.unassignPlatFromRegime(regimeId, platId, this.userId).subscribe({
        next: (response) => {
          console.log('Réponse du serveur :', response);
          this.loadRegimes();
          this.loadStats();
          this.showNotification('Plat désassigné avec succès.', 'success');
        },
        error: (err) => {
          console.error('Erreur lors de la désassignation du plat :', err);
          if (err.status === 403) {
            this.showNotification('Vous n\'avez pas les permissions nécessaires pour désassigner des plats.', 'error');
          } else if (err.status === 0) {
            this.showNotification('Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
          } else {
            this.showNotification('Une erreur est survenue : ' + err.message, 'error');
          }
        }
      });
    }
  }

  getRegimeTypes(regimes: RegimeAlimentaire[]): string {
    return regimes.map(r => r.type).join(', ');
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
 
  
  generatePdfRecommendations() {
    this.pdfGenerator.recommondation().subscribe((response: Blob) => {
      if (response) {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recommandations_nutritionnelles_optimise.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error: No response received');
      }
    }, (error) => {
      console.error('Error:', error);
    });
  }
  

 
  
  
}