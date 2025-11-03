import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schema for webhook payload validation
const webhookSchema = z.object({
  orderId: z.string().uuid('Invalid Order ID'),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  status: z.enum(['confirmed', 'failed']),
});

// Initialize the Supabase admin client. This is necessary for server-to-server communication
// where there is no user session. It uses the service role key to bypass RLS.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // IMPORTANT: In a production environment, you must verify the webhook signature
    // to ensure the request is coming from a trusted source.
    // For now, we will proceed without verification for simplicity.

    // 1. Parse and validate the request body
    const body = await request.json();
    console.log("DEBUG: Webhook request body", body);
    const validation = webhookSchema.safeParse(body);
    console.log("DEBUG: Webhook validation data", validation.data);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { orderId, txHash, status } = validation.data;

    // 2. Update the transaction record in the database
    const { data, error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ 
        status: status,
        tx_hash: txHash 
      })
      .eq('id', orderId)
      .select('id')
      .single();

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      // If the orderId doesn't exist, PgrstError code 204 is returned (No Content)
      if (updateError.code === 'PGRST116') { 
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update transaction status' }, { status: 500 });
    }

    // TODO: Trigger a notification to the merchant via their configured webhook_url

    // 3. Return a success response
    return NextResponse.json({ message: 'Webhook received and transaction updated successfully.' });

  } catch (e) {
    console.error('Webhook Error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
