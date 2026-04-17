export const APP_NAME = 'CareSphere';
export const VERSION = '1.0.0';

export interface UserDTO {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'CAREGIVER' | 'ADMIN';
}
