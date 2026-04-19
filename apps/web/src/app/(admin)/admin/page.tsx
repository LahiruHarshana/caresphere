import { redirect } from 'next/navigation';

export default function AdminDashboardRedirect() {
  // Automatically redirect /admin to the analytics dashboard
  redirect('/admin/analytics');
}
