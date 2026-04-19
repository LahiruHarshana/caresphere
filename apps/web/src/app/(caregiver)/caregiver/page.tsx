import { redirect } from 'next/navigation';

export default function CaregiverDashboardRedirect() {
  // Automatically redirect /caregiver to the gigs page
  redirect('/gigs');
}
