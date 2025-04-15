export class Produit {
    produitID?: number; // Optional (since it is auto-generated)
    nomProduit!: string;
    description!: string;
    quantite!: number;
    seuil_alerte!: number;
    date_peremption!: Date;
    barcode!: string;
}