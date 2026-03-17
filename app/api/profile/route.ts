import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Fetch role with explicit join
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select(
      `
      role:roles (
        name
      )
    `
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError) {
    console.error('API Profile - Role Fetch Error:', roleError.message);
  }

  // handle role identification
  let roleName: string | null = null;

  // 1. Try role from profile table first (Master Source)
  if (
    profile &&
    typeof profile === 'object' &&
    'role' in profile &&
    profile.role
  ) {
    roleName = profile.role as string;
    console.log(
      `API Profile - Role from profiles (MASTER) for ${user.email}: ${roleName}`
    );
  }

  // 2. Fallback to user_roles join if profile doesn't have it
  if (!roleName) {
    const rawRole = userRole?.role;
    if (rawRole) {
      if (Array.isArray(rawRole)) {
        roleName = (rawRole[0] as { name: string })?.name || null;
      } else {
        roleName = (rawRole as { name: string }).name || null;
      }
    }
    console.log(
      `API Profile - Role from user_roles fallback for ${user.email}: ${roleName}`
    );
  }

  // Self-repair: If no role is found anywhere, attempt to assign 'Clients' role
  if (!roleName) {
    if (user.app_metadata?.role) {
      roleName = user.app_metadata.role as string;
    } else {
      const { data: clientRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'Clients')
        .single();

      if (clientRole) {
        // Assign in DB
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: clientRole.id,
          });

        if (!insertError) {
          roleName = 'Clients';
        }
      }
    }
  }

  return NextResponse.json({
    ...profile,
    role: roleName,
  });
}
