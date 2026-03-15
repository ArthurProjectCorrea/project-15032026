import { cache } from 'react';
import { createClient } from './server';

export interface UserProfile {
  id: string;
  name: string | null;
  document: string | null;
  phone: string | null;
  role: 'Admin' | 'Clients' | null;
}

/**
 * Per-request memoization of the user profile.
 * Fetches from the internal API route to handle RLS correctly.
 */
export const getProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    // Use absolute URL for server-side SSR fetch
    // Note: In a real production env, this usually comes from an env var
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Fetch from internal API to satisfy RLS and potentially use server-side caching
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const response = await fetch(`${baseUrl}/api/profile`, {
      headers: {
        cookie: cookieStore.toString(),
      },
      next: {
        revalidate: 60, // Cache for 1 minute
        tags: [`profile-${session.user.id}`],
      },
    });

    if (!response.ok) {
      if (response.status !== 404) {
        console.error('Error fetching profile from API:', response.statusText);
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
});
