import { ResetPasswordForm } from '@/components/forms/reset-password-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ResetPasswordForm email={user?.email} />;
}
