import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers';

export async function createClient() {
  console.log("DEBUG: createClient called in server.ts");
  console.log("DEBUG: NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return await cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              await cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}