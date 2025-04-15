import { Plat } from "./plat.model";
import { RegimeAlimentaireType } from "./regime.model";
import { User } from "./user.model";

export interface Menu {
    id: number;
    date: Date;
    regime: RegimeAlimentaireType;
    plats: Plat[];
    isValidated: boolean;
    totalCalories: number;
    createdBy?: User;
    validatedBy?: User;
  }