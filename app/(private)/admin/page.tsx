import { getProfile } from '@/lib/supabase/profile';
import { ProfileNotFound } from '@/components/auth/profile-not-found';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function PrivatePage() {
  const profile = await getProfile();

  if (!profile) {
    return <ProfileNotFound />;
  }

  return <AdminDashboard />;
}
