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
import { ForecastDialogComponent } from './forecast-dialog/forecast-dialog.component';
import { NgChartsModule } from 'ng2-charts';
@NgModule({
  declarations: [ ProductFormComponent, ProduitHistoriqueComponent, ToastComponent,ProduitDashboardComponent, ForecastDialogComponent, ProductListComponent],
  imports: [CommonModule, HttpClientModule, FormsModule,ReactiveFormsModule,MatDialogModule,RouterModule,MatIconModule,ZXingScannerModule,MatPaginatorModule,MatTableModule,NgChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [ProductService],
  exports: [ ProductFormComponent, ProduitHistoriqueComponent, ToastComponent, ProductListComponent]
})
export class ProductsModule {}
