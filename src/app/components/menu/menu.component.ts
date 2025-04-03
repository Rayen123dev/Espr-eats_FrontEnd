import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../../core/models/menu.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menus: Menu[] = [];
  filteredMenus: Menu[] = [];
  paginatedMenus: Menu[] = [];
  categories: string[] = ['NORMAL', 'SPORTIF', 'DIABETIQUE', 'VEGETARIEN'];
  selectedCategory: string = '';
  selectedDate: string = ''; // Pas de date par défaut
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getValidatedMenus().subscribe(
      data => {
        this.menus = data;
        this.filteredMenus = data; // Afficher tous les menus au départ
        this.updatePagination(); // Pas de filtre initial par date
      }, 
      error => {
        console.error('Erreur lors de la récupération des menus:', error);
      }
    );
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilters();
  }

  filterByDate() {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.menus;

    // Filtrer par date uniquement si une date est sélectionnée et "Appliquer" est cliqué
    if (this.selectedDate) {
      result = result.filter(menu => {
        const menuDate = new Date(menu.date).toISOString().split('T')[0];
        return menuDate === this.selectedDate;
      });
    }

    // Filtrer par catégorie si une catégorie est sélectionnée
    if (this.selectedCategory) {
      result = result.filter(menu => 
        menu.regime.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    this.filteredMenus = result;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredMenus.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedMenus = this.filteredMenus.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getPlatsByType(menu: Menu, type: string): any[] {
    return menu.plats.filter(plat => plat.categorie.toLowerCase() === type.toLowerCase());
  }
}