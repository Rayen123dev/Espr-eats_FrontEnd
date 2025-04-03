import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../../core/models/menu.model';
import { RegimeAlimentaireType } from '../../../core/models/regime.model';

@Component({
  selector: 'app-menu-dashboard',
  templateUrl: './menu-dashboard.component.html',
  styleUrls: ['./menu-dashboard.component.css']
})
export class MenuDashboardComponent implements OnInit {
  @Input() userId?: number;
  @Input() userRole?: string;

  menus: Menu[] = [];
  filteredMenus: Menu[] = []; // Liste des menus filtrés
  errorMessage: string = '';
  isLoading: boolean = false;
  regimeTypes = Object.values(RegimeAlimentaireType); // Liste des types de régimes
  selectedRegimeType: string = 'ALL'; // Type de régime sélectionné (par défaut : tous)

  constructor(
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.userId) {
      this.getMenus();
    } else {
      this.errorMessage = 'Utilisateur non identifié. Veuillez vous connecter.';
    }
  }

  getMenus(): void {
    if (!this.userId) return;
    this.isLoading = true;
    this.menuService.getAllMenus(this.userId).subscribe({
      next: (data) => {
        this.menus = data;
        this.filterMenus(); // Appliquer le filtre initial
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Erreur de récupération des menus';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // Filtrer les menus en fonction du type de régime sélectionné
  filterMenus(): void {
    if (this.selectedRegimeType === 'ALL') {
      this.filteredMenus = [...this.menus];
    } else {
      this.filteredMenus = this.menus.filter(menu => menu.regime === this.selectedRegimeType);
    }
    this.cdr.detectChanges();
  }

  // Gérer le changement de type de régime
  onRegimeTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedRegimeType = selectElement.value;
    this.filterMenus();
  }

  generateMenus(): void {
    if (!this.userId || !this.canGenerateMenus()) return;
    this.isLoading = true;
    this.menuService.generateMenus(this.userId).subscribe({
      next: (message) => {
        this.isLoading = false;
        alert(message);
        this.getMenus();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la génération des menus';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  validateMenus(menuIds: number[]): void {
    if (!this.userId || !this.canValidateMenus()) return;
    const doctorId = this.userId;
    this.menuService.validateMenus(doctorId, menuIds, { responseType: 'text' }).subscribe({
      next: (message) => {
        console.log(message);
        alert(message);
        this.getMenus();
      },
      error: (err) => {
        console.error('Erreur lors de la validation des menus', err);
        this.errorMessage = 'Erreur lors de la validation des menus';
      }
    });
  }

  regenerateMenus(): void {
    if (!this.userId || !this.canGenerateMenus()) return;
    this.menuService.regenerateMenus(this.userId).subscribe({
      next: (message) => {
        alert(message);
        this.getMenus();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la régénération des menus';
        console.error(err);
      }
    });
  }

  canGenerateMenus(): boolean {
    return this.userRole === 'Staff' || this.userRole === 'Medecin';
  }

  canValidateMenus(): boolean {
    return this.userRole === 'Medecin';
  }
}