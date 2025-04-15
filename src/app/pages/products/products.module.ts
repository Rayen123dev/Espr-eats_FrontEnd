import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductService } from '../../services/product.service';
import { MatDialogModule } from '@angular/material/dialog';
import { ProduitHistoriqueComponent } from './produit-historique/produit-historique.component';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './toast/toast.component'; 
import { MatIconModule } from '@angular/material/icon';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ProduitDashboardComponent } from './produit-dashboard/produit-dashboard.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
@NgModule({
  declarations: [ProductListComponent, ProductFormComponent, ProduitHistoriqueComponent, ToastComponent,ProduitDashboardComponent],
  imports: [CommonModule, HttpClientModule, FormsModule,ReactiveFormsModule,MatDialogModule,RouterModule,MatIconModule,ZXingScannerModule,MatPaginatorModule,MatTableModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ProductService],
  exports: [ProductListComponent, ProductFormComponent, ProduitHistoriqueComponent, ToastComponent]
})
export class ProductsModule {}
