export enum Role {
    Staff = 'Staff',
    Admin = 'Admin',
    Medecin = 'Medecin'
  }
  
  export interface User {
    id: number;
    username: string;
    role: Role;
  }