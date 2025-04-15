import { Plat } from "./plat.model";
import { User } from "./user.model";

export enum RegimeAlimentaireType {
    NORMAL = 'NORMAL',
    DIABETIQUE = 'DIABETIQUE', 
    SPORTIF = 'SPORTIF',
    VEGETARIEN = 'VEGETARIEN'
  }
  
  export interface RegimeAlimentaire {
    id: number;
    type: RegimeAlimentaireType;
    platsRecommandes: Plat[];
    addedBy?: User;
  }