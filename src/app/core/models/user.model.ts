export enum Role {
  Staff = 'Staff',
  Medecin = 'Medecin'
}

export interface User {
  id: number;
  username: string;
  role: Role;
}