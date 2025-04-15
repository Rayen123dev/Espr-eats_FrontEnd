import { TypeTransaction } from "./TypeTransaction ";

export interface ProduitHistorique {
    historiqueID: number;
    quantite: number;
    date: Date;
    type: TypeTransaction; 
    produit: {
        produitID: number;
        barcode: string;
        nomProduit: string;
        description: string;
        quantite: number;
        seuil_alerte: number;
        date_peremption: Date | null;
      } | null;
  }
  