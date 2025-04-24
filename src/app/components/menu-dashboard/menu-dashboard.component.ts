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
  notificationMessage: string = ''; // Remplace successMessage et errorMessage
  notificationType: 'success' | 'error' | null = null; // Type de notification
  isLoading: boolean = false;
  regimeTypes = Object.values(RegimeAlimentaireType); // Liste des types de régimes
  selectedRegimeType: string = 'ALL'; // Type de régime sélectionné (par défaut : tous)
  rejectedMenuIds: Set<number> = new Set();

  constructor(
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.userId) {
      this.getMenus();
    } else {
      this.showNotification('Utilisateur non identifié. Veuillez vous connecter.', 'error');
    }
  }

  // Méthode pour afficher une notification
  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => this.clearNotification(), 5000);
  }

  // Méthode pour effacer la notification
  clearNotification(): void {
    this.notificationMessage = '';
    this.notificationType = null;
    this.cdr.detectChanges();
  }

  getMenus(): void {
    if (!this.userId) return;
    this.isLoading = true;
    this.menuService.getAllMenus(this.userId).subscribe({
      next: (data) => {
        this.menus = data;
        this.filterMenus();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showNotification('Erreur de récupération des menus', 'error');
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
      next: (response) => {
        this.isLoading = false;
        this.showNotification(response.message || 'Menus générés avec succès', 'success');
        this.getMenus();
      },
      error: (err) => {
        this.showNotification('Erreur lors de la génération des menus', 'error');
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
        this.showNotification(message, 'success');
        this.filteredMenus = this.filteredMenus.map(menu =>
          menuIds.includes(menu.id) ? { ...menu, isValidated: true } : menu
        );
        menuIds.forEach(id => this.rejectedMenuIds.delete(id));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la validation des menus', err);
        this.showNotification('Erreur lors de la validation des menus', 'error');
      }
    });
  }

  rejectMenus(menuIds: number[]): void {
    const rejectionReason = prompt('Veuillez entrer la raison du rejet :');
    if (!this.userId || !this.canValidateMenus() || !rejectionReason) return;
    const doctorId = this.userId;
    this.menuService.rejectMenus(doctorId, menuIds, rejectionReason).subscribe({
      next: (message) => {
        this.showNotification(message || 'Menu rejeté avec succès', 'success');
        menuIds.forEach(id => this.rejectedMenuIds.add(id));
        this.cdr.detectChanges();
      },

    });
       this.showNotification('Menu rejeté avec succès', 'success');
  }

  regenerateMenus(): void {
    if (!this.userId || !this.canGenerateMenus()) return;
    this.menuService.regenerateMenus(this.userId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showNotification(response.message || 'Menus régénérés avec succès', 'success');
        this.getMenus();
      },
      error: (err) => {
        this.showNotification('Erreur lors de la régénération des menus', 'error');
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
  isRejected(menuId: number): boolean {
    return this.rejectedMenuIds.has(menuId);
  }
}
