export class RegisterDto {
  email!: string;
  password!: string;
  role!: 'CUSTOMER' | 'CAREGIVER';
  firstName!: string;
  lastName!: string;
}
