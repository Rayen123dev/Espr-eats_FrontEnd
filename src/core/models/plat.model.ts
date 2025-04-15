import { Produit } from "src/app/models/Produit.model";
import { RegimeAlimentaire } from "./regime.model";
import { User } from "./user.model";

export enum CategoriePlat {
    ENTREE = 'ENTREE',
    PLAT_PRINCIPAL = 'PLAT_PRINCIPAL',
    DESSERT = 'DESSERT'
  }
  
export interface Plat {
    id: number;
    nom: string;
    description: string;
    categorie: CategoriePlat;
    calories: number;
    imagePath?: string;
    addedBy?: User;
    regimes?: RegimeAlimentaire[];
  
  }