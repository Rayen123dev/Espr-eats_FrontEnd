import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Produit } from '../models/Produit.model';
import { ToastService } from './toast.service';
import { switchMap, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8081/produit';
  private apiUrl2 = 'http://localhost:8081'; // Base API URL
  private productsSubject = new BehaviorSubject<Produit[]>([]); // Holds the list of products
  products$ = this.productsSubject.asObservable(); // Observable to share product list

  constructor(private http: HttpClient,private toastService: ToastService) {}

  // Fetch all products
  getProducts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/retrieve-all-produits`);
  }

  /* // Add a new product
  addProduct(product: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/add-produit`, product);
  } */
    addProduct(product: Produit): Observable<Produit> {
      return this.http.post<Produit>(`${this.apiUrl}/add-produit`, product).pipe(
        // Trigger toast notification after product is added
        tap(() => {
          this.toastService.showToast(`Product '${product.nomProduit}' added successfully!`);
          this.refreshProductList();
        })
      );
    }
  /* // Delete a product by ID
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove-produit/${id}`);
  }
 */

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/remove-produit/${id}`, {
      responseType: 'text'
    }).pipe(
      tap((msg: string) => {
        this.toastService.showToast(msg);
        this.refreshProductList();
      })
    );
  }
  

  /* // Update a product by ID
  updateProduct(id: number, product: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/modify-produit/${id}`, product);
  }
 */
  updateProduct(id: number, product: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/modify-produit/${id}`, product).pipe(
      // Trigger toast notification after product is updated
      tap(() => {
        this.toastService.showToast(`Product '${product.nomProduit}' updated successfully!`);
        this.refreshProductList();
      })
    );
  }

  getProductByBarcode(barcode: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/barcode/${barcode}`);
  }
  refreshProductList() {
    this.getProducts().subscribe((products) => {
      this.productsSubject.next(products); // Emit the updated list
    });
  }

  uploadBarcode(file: File): Observable<Produit> {
    const formData = new FormData();
    formData.append('barcode', file, file.name);
  
    return this.http.post<string>(`${this.apiUrl}/barcode/upload-barcode`, formData).pipe(
      switchMap((barcode: string) => {
        // Get the product by barcode
        return this.getProductByBarcode(barcode); // Returns Observable<Produit>
      }),
      switchMap((product: Produit) => {
        if (product.produitID) {
          // Product exists, so update it
          return this.updateProduct(product.produitID, product);
        } else {
          // Product does not exist, so add it
          return this.addProduct(product);
        }
      }),
      tap((updatedProduct) => {
        // Trigger toast notification after product is added or updated
        const action = updatedProduct.produitID ? 'updated' : 'added';
        this.toastService.showToast(`Product ${updatedProduct.nomProduit} has been ${action} successfully!`);
        this.refreshProductList(); // Refresh product list after adding or updating
      })
    );
  }
  ///statistics////
  // Get low stock count
  getLowStockCount(threshold: number = 5): Observable<number> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<number>(`${this.apiUrl}/low-stock-count`, { params });
  }

  // Get expired product count
  getExpiredProductCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/expired-count`);
  }

  // Get average stock level
  getAverageStockLevel(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average-stock-level`);
  }

  // Get total product count
  getTotalProductCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-count`);
  }

  // Get out-of-stock count
  getOutOfStockCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/out-of-stock-count`);
  }

  // Get products near expiry (within a specified number of days)
  getProductsNearExpiry(daysBeforeExpiry: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/near-expiry/${daysBeforeExpiry}`);
  }
  
  /// AI 
  getForecast(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/predict`, data);
  }
}

