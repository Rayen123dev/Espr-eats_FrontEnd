import { Component, OnInit } from '@angular/core';
import { Produit } from 'src/app/models/Produit.model';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ToastService } from 'src/app/services/toast.service';
import { AlertService } from 'src/app/services/alert.service';
import { BrowserMultiFormatReader } from '@zxing/library';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Produit[] = [];
  filteredProducts: Produit[] = [];
  nameFilter: string = '';
  minQuantity: number | null = null;
  maxQuantity: number | null = null;
  barcodeFilter: string = '';
  alertThreshold: number | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  alerts: { produitID: number; nomProduit: string; status: string }[] = [];



  constructor(private productService: ProductService,private router: Router,public dialog: MatDialog, private toastService: ToastService,private alertService :AlertService) { }
  ngOnInit(): void {
    // Subscribe to product list updates
    this.productService.products$.subscribe((products) => {
      this.products = products;
      this.filteredProducts = [...this.products];
    });

    // Initial fetch of products
    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      this.filteredProducts = [...this.products];
    });
    this.productService.refreshProductList();
    this.toastService.showToast('Testing toast notification!');
    this.checkAlerts();
  }

  checkAlerts(): void {
    this.alerts = this.products
      .filter(product => product.produitID !== undefined) 
      .filter(product => product.quantite <= product.seuil_alerte || this.isExpired(product.date_peremption))
      .map(product => ({
        produitID: product.produitID!, 
        nomProduit: product.nomProduit,
        status: this.getStatus(product)
      }));
  }
  
  getStatus(product: Produit): string {
    const isLowStock = product.quantite <= product.seuil_alerte;
    const isExpired = this.isExpired(product.date_peremption);
    if (isLowStock && isExpired) return "Low Stock & Expired";
    if (isLowStock) return "Low Stock";
    if (isExpired) return "Expired";
    return "";
  }

  isExpired(dateString: Date): boolean {
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate <= today;
  }
  hideAlerts() {
    this.alerts = []; 
  }
  applyFilter() {
    this.filteredProducts = this.products.filter(product => {
      return (
        (!this.nameFilter || product.nomProduit.toLowerCase().includes(this.nameFilter.toLowerCase())) &&
        (this.minQuantity === null || product.quantite >= this.minQuantity) &&
        (this.maxQuantity === null || product.quantite <= this.maxQuantity) &&
        (this.alertThreshold === null || product.seuil_alerte === this.alertThreshold)&&
        (!this.barcodeFilter || product.barcode?.includes(this.barcodeFilter))
      );
    });
  }
  resetFilters() {
    this.nameFilter = '';
    this.minQuantity = null;
    this.maxQuantity = null;
    this.alertThreshold = null;
    this.barcodeFilter = '';
    this.filteredProducts = [...this.products]; // Reset filtered products to original list
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: (response) => {
        // Successfully deleted product
        console.log('Product deleted successfully:', response);
        this.products = this.products.filter((product) => product.produitID !== id);
        // Optionally, refresh product list after deletion
        this.productService.refreshProductList();
      },
      error: (err) => {
        console.error('Error response:', err);
        this.errorMessage = 'Failed to delete product';
        this.successMessage = ''; // Clear any previous success message
  
        this.autoHideMessage();
      }
    });
  }
  
  
  autoHideMessage(): void {
    setTimeout(() => {
      this.successMessage = ''; 
      this.errorMessage = ''; 
    }, 5000); 
  }
  
  
  openProductForm(product: Produit | null): void {
    const isEditMode = product && product.produitID !== undefined;  
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: { product: product, isEditMode: isEditMode }, 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  
  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    
    if (file) {
      // Initialize barcode reader
      const codeReader = new BrowserMultiFormatReader();
  
      // Decode image file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result;
        codeReader.decodeFromImageUrl(imageData)
          .then(result => {
            const barcode = result.getText().trim();
        
            this.productService.getProductByBarcode(barcode).subscribe(
              (product: Produit | null) => {
              if (product) {
                console.log('Product exists, opening form for update:', product);
                this.openProductForm(product); 
              } else {
                console.log('Barcode extracted from image:', barcode);
                const newProduct: Produit = {
                barcode: barcode, 
                nomProduit: 'New Product', 
                description: 'Description of new product', 
                quantite: 1, 
                seuil_alerte: 5, 
                date_peremption: new Date()
                };
                this.openProductForm(newProduct); 
              }
              },
              error => {
              if (error.status === 404) {
                const barcode = result.getText().trim();
                console.log('Creating new product with barcode:', barcode)
                const newProduct: Produit = {
                barcode: barcode, 
                nomProduit: 'New Product', 
                description: 'Description of new product', 
                quantite: 1, 
                seuil_alerte: 5, 
                date_peremption: new Date()
                };
                this.openProductForm(newProduct); 
              } else {
                console.error('Error fetching product:', error);
              }
              }
            );
          })
          .catch(error => {
            console.error('Error decoding barcode:', error);
          });
      };
      reader.readAsDataURL(file); 
    }
  }

 /*  search(text: string) {
    this.http.post<{ filter: string }>('http://localhost:8080/api/ai/parse', {
      query: text
    }).subscribe(res => {
      console.log('AI Filter:', res.filter);
      this.productService.searchWithCondition(res.filter).subscribe(products => {
        console.log('Filtered Products:', products);
        // Optionally update view or state
      });
    });
  }
   */

}
