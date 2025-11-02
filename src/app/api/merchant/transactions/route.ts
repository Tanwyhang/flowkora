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

    // 2. Fetch transactions for the authenticated merchant
    // RLS is enabled, so this query is secure by default.
    const { data: transactions, error: selectError } = await supabase
      .from('transactions')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error('Supabase Select Error:', selectError);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // 3. Return the successful response
    return NextResponse.json(transactions);

  } catch (e) {
    console.error('Fetch Transactions Error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
