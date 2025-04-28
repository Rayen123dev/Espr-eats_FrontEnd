export enum UserRole {
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
    USER = 'USER'
  }
  
  export interface User {
    userid: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
  }