import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { Produit } from 'src/app/models/Produit.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from 'src/app/services/toast.service';
import { Exception, NotFoundException, Result } from '@zxing/library'; 
import { BarcodeFormat, BrowserMultiFormatReader } from '@zxing/library';


@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isEditMode: boolean = false;
  stream: MediaStream | null = null;
 
 

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Produit | null, isEditMode: boolean } ,
    private toastService: ToastService
    
  ) {
    this.productForm = this.fb.group({
      nomProduit: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      quantite: [0, [Validators.required, Validators.min(1)]],
      seuil_alerte: [0, [Validators.required, Validators.min(1)]],
      date_peremption: ['', [Validators.required]],
      barcode: ['']
    });
   
  }

  ngOnInit(): void {
    if (this.data.product) {
      this.isEditMode = this.data.isEditMode; 
      this.productForm.patchValue(this.data.product);
      if (this.data.product.barcode) {
        this.productForm.get('barcode')?.setValue(this.data.product.barcode);
      }
      if (this.isEditMode) {
        this.productForm.patchValue(this.data.product);  
      }
    }
    
  }
 
  saveProduct(): void {
    if (this.productForm.valid) {
      const product: Produit = this.productForm.value;
      if (this.isEditMode && this.data.product?.produitID !== undefined) {
        // Update existing product
        this.productService.updateProduct(this.data.product!.produitID, product).subscribe({
          next: (response) => {
            this.successMessage = 'Product updated successfully!';
            this.toastService.showToast('Product updated successfully!');
            this.errorMessage = '';
            this.productForm.reset();
            setTimeout(() => {
              this.dialogRef.close(response); 
            }, 3000)
            this.productService.refreshProductList(); 
          },
          error: (err) => {
            this.errorMessage = 'Failed to update product';
            this.successMessage = '';
          }
        });
      } else {
        // Add new product
        this.productService.addProduct(product).subscribe({
          next: (response) => {
            this.successMessage = 'Product added successfully!';
            this.toastService.showToast('Product added successfully!');
            this.errorMessage = '';
            this.productForm.reset();
            setTimeout(() => {
              this.dialogRef.close(response); 
            }, 3000)
            this.productService.refreshProductList(); 
          },
          error: (err) => {
            this.errorMessage = 'Failed to add product';
            this.successMessage = '';
          }
        });
      }
    } else {
      this.errorMessage = 'Please fill in the form correctly';
      this.successMessage = '';
    }
  }

 
  // Getter methods for easy access to form controls
  get nomProduit() { return this.productForm.get('nomProduit'); }
  get description() { return this.productForm.get('description'); }
  get quantite() { return this.productForm.get('quantite'); }
  get seuil_alerte() { return this.productForm.get('seuil_alerte'); }
  get date_peremption() { return this.productForm.get('date_peremption'); }
  get barcode() { return this.productForm.get('barcode'); }

}
