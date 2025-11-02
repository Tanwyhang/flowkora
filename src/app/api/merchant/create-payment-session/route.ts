import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

// Zod schema for input validation
const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USDC', 'USDT', 'DAI']),
  orderId: z.string().min(1, 'Order ID is required'),
  customerEmail: z.string().email('Invalid email address').optional(),
  callbackUrl: z.string().url('Invalid callback URL'),
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate the request body
    const body = await request.json();
    const validation = createPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { amount, currency, orderId, customerEmail, callbackUrl } = validation.data;

    // 3. Create the transaction record in the database
    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        merchant_id: user.id,
        merchant_order_id: orderId,
        amount,
        currency,
        customer_email: customerEmail,
        callback_url: callbackUrl,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      // Handle potential duplicate order ID for the same merchant
      if (insertError.code === '23505') { // Unique violation error code
        return NextResponse.json({ error: 'A payment session for this Order ID already exists.' }, { status: 409 });
      }
      console.error('Supabase Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
    }

    // 4. Generate the payment URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${appUrl}/pay/${transaction.id}`;

    // 5. Return the successful response
    return NextResponse.json({ payment_url: paymentUrl });

  } catch (e) {
    console.error('Create Payment Session Error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
