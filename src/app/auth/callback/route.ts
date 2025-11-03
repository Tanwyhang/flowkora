import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    console.log("DEBUG: Code received in callback", code);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("DEBUG: Session exchange result", data, error);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard');
}
