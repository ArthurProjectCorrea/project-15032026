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

  // Handle various response shapes from joins
  let roleName: string | null = null;
  const rawRole = userRole?.role;

  if (rawRole) {
    if (Array.isArray(rawRole)) {
      roleName = rawRole[0]?.name || null;
    } else {
      roleName = (rawRole as { name: string }).name || null;
    }
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
