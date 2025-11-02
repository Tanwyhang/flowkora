import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch API keys for the authenticated merchant
    // We explicitly select columns to avoid exposing the key_hash.
    const { data: apiKeys, error: selectError } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, status, created_at, last_used_at, expires_at')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error('Supabase Select Error:', selectError);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    // 3. Return the successful response
    return NextResponse.json(apiKeys);

  } catch (e) {
    console.error('Fetch API Keys Error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
