import { redirect } from 'next/navigation';

export default function CustomerDashboardRedirect() {
  // Automatically redirect /customer to the profile page
  redirect('/customer/profile');
}
