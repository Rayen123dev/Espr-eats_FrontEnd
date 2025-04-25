import { Component } from '@angular/core';
import { ProduitHistorique } from 'src/app/models/ProduitHistorique ';
import { TypeTransaction } from 'src/app/models/TypeTransaction ';
import { ProduitHistoriqueService } from 'src/app/services/produit-historique.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-produit-historique',
  templateUrl: './produit-historique.component.html',
  styleUrls: ['./produit-historique.component.css']
})
export class ProduitHistoriqueComponent {

  historiqueList: ProduitHistorique[] = [];
  filteredHistoriqueList: ProduitHistorique[] = [];

  typeFilter: string = '';
  minQuantiteFilter: number | null = null;
  maxQuantiteFilter: number | null = null;
  startDateFilter: string = '';
  endDateFilter: string = '';
  barcodeFilter: string = '';
  aiSummary: string = '';

  constructor(private produitHistoriqueService: ProduitHistoriqueService) { }

  ngOnInit(): void {
    this.fetchHistorique(); 
    this.filteredHistoriqueList = [...this.historiqueList]; 
    
  }

  fetchHistorique(): void {
    this.produitHistoriqueService.getAllHistorique().subscribe(
      (data) => {
        this.historiqueList = data;  
        this.filteredHistoriqueList = [...this.historiqueList];
      },
      (error) => {
        console.error('Error fetching historique data:', error);  // Handle any errors
      }
    );
  } 
  
  // Apply the filters for historique list
  applyFilter(): void {
    this.filteredHistoriqueList = this.historiqueList.filter(historique => {
      return (
        (!this.typeFilter || historique.type.toLowerCase().includes(this.typeFilter.toLowerCase())) &&
        (this.minQuantiteFilter === null || historique.quantite >= this.minQuantiteFilter) &&
        (this.maxQuantiteFilter === null || historique.quantite <= this.maxQuantiteFilter) &&
        (!this.startDateFilter || new Date(historique.date) >= new Date(this.startDateFilter)) &&
        (!this.endDateFilter || new Date(historique.date) <= new Date(this.endDateFilter))&&
        (this.barcodeFilter ? historique.produit?.barcode?.toLowerCase().includes(this.barcodeFilter.toLowerCase()) : true)
      );
    });
  }

  // Reset the filters
  resetFilters(): void {
    this.typeFilter = '';
    this.minQuantiteFilter = null;
    this.maxQuantiteFilter = null;
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.barcodeFilter = ''; 
    this.filteredHistoriqueList = [...this.historiqueList]; 
  }

  getTransactionType(type: TypeTransaction): string {
    switch (type) {
      case TypeTransaction.ENTREE:
        return 'Entry';
      case TypeTransaction.SORTIE:
        return 'Exit';
      case TypeTransaction.CREATED:
        return 'Created';
      case TypeTransaction.UPDATED:
        return 'Updated';
      case TypeTransaction.DELETED:
        return 'Deleted';
      case TypeTransaction.IN:
        return 'In';
      case TypeTransaction.OUT:
        return 'Out';
      default:
        return type;
    }
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
  
    const logoUrl = 'assets/img/espriteatsnb.png';
    const margin = 10;
    const rowHeight = 8;
    const columnWidths = [20, 50, 30, 25, 35, 35];
    const headers = ['ID', 'Product Name', 'Type', 'Quantity', 'Date', 'Expiration Date'];
  
    const data = this.filteredHistoriqueList.map(h => [
      h.historiqueID,
      h.produit?.nomProduit || 'No Product',
      h.type,
      h.quantite,
      new Date(h.date).toLocaleDateString(),
      h.produit?.date_peremption ? new Date(h.produit.date_peremption).toLocaleDateString() : 'No Expiration'
    ]);
  
    let startX = margin;
    let startY = 45;
    let currentPage = 1;
  
    // Add logo
    doc.addImage(logoUrl, 'PNG', margin, 10, 25, 25);
  
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const title = 'Product History';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 25);
  
    // Timestamp
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated on: ${timestamp}`, pageWidth - margin - 60, 35);
  
    // Draw table header
    function drawTableHeader() {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      let cellX = startX;
      headers.forEach((header, i) => {
        doc.rect(cellX, startY, columnWidths[i], rowHeight);
        doc.text(header, cellX + 2, startY + 5);
        cellX += columnWidths[i];
      });
      startY += rowHeight;
    }
  
    // Draw footer with page number
    function drawFooter(pageNum: number) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${pageNum}`, pageWidth - margin - 20, pageHeight - 10);
    }
  
    // Draw first table header
    drawTableHeader();
  
    // Table body
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
  
    data.forEach((row, rowIndex) => {
      // Check page break
      if (startY + rowHeight > pageHeight - 20) {
        drawFooter(currentPage);
        doc.addPage();
        currentPage++;
        startY = 20;
  
        // Reapply styles (important!)
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 15);
  
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${timestamp}`, pageWidth - margin - 60, 22);
  
        startY = 30;
        drawTableHeader();
  
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
      }
  
      let cellX = startX;
      row.forEach((cell, i) => {
        doc.rect(cellX, startY, columnWidths[i], rowHeight);
        doc.text(String(cell), cellX + 2, startY + 5);
        cellX += columnWidths[i];
      });
  
      startY += rowHeight;
    });
  
    drawFooter(currentPage);
    doc.save('product-history.pdf');
  }

}
