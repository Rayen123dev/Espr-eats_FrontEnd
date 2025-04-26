import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { Produit } from 'src/app/models/Produit.model';

@Component({
  selector: 'app-produit-dashboard',
  templateUrl: './produit-dashboard.component.html',
  styleUrls: ['./produit-dashboard.component.css']
})
export class ProduitDashboardComponent implements OnInit {
  totalStockValue: number = 0;
  lowStockCount: number = 0;
  expiredProductCount: number = 0;
  averageStockLevel: number = 0;
  totalProductCount: number = 0;
  outOfStockCount: number = 0;
  nearExpiryProducts: Produit[] = [];


  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productService.refreshProductList(); 
    this.fetchStatistics();
  }

  fetchStatistics(): void {
    // Fetch low stock count
    this.productService.getLowStockCount(5).subscribe(
      (count) => {
        this.lowStockCount = count;
      },
      (error) => {
        console.error('Error fetching low stock count:', error);
      }
    );

    // Fetch expired product count
    this.productService.getExpiredProductCount().subscribe(
      (count) => {
        this.expiredProductCount = count;
      },
      (error) => {
        console.error('Error fetching expired product count:', error);
      }
    );

    // Fetch average stock level
    this.productService.getAverageStockLevel().subscribe(
      (average) => {
        this.averageStockLevel = average;
      },
      (error) => {
        console.error('Error fetching average stock level:', error);
      }
    );

    // Fetch total product count
    this.productService.getTotalProductCount().subscribe(
      (count) => {
        this.totalProductCount = count;
      },
      (error) => {
        console.error('Error fetching total product count:', error);
      }
    );

    // Fetch out-of-stock count
    this.productService.getOutOfStockCount().subscribe(
      (count) => {
        this.outOfStockCount = count;
      },
      (error) => {
        console.error('Error fetching out of stock count:', error);
      }
    );

  
    this.productService.getProductsNearExpiry(10).subscribe(
      (products) => {
        this.nearExpiryProducts = products; 
      },
      (error) => {
        console.error('Error fetching products near expiry:', error);
      }
    );
  }

getDaysUntilExpiry(product: Produit): number {
  const today = new Date();
  const expiryDate = new Date(product.date_peremption);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
  
  goToProductList(): void {
    this.router.navigate(['/admin-layout/product-list']);
  }
}
