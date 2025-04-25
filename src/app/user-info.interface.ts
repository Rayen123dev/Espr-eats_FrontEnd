// user-info.interface.ts
import { User } from './login.service';

export interface UserInfo {
  name: string;
  email: string;
  billingAddress: string;
}

export function mapUserToUserInfo(user: User): UserInfo {
  return {
    name: user.nom, 
    email: user.email,
    billingAddress: 'Unknown Address', // Fallback since billingAddress is not available in User
  };
}
