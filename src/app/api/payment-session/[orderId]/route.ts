import { NextResponse } from 'next/server';
import { createApiRouteClient } from '@/lib/supabase/api';

export async function GET(request: Request, context: any) {
  const supabase = await createApiRouteClient();
  const { orderId } = context.params;

  try {
    // Fetch payment session details from the database
    const { data: paymentSession, error } = await supabase
      .from('transactions') // Assuming payment sessions are stored in the transactions table
      .select('amount, currency, merchant_order_id, customer_email, callback_url, id, merchant_payout_wallet_address')
      .eq('id', orderId)
      .single();
    console.log("DEBUG: Payment session data in payment-session/[orderId]/GET", paymentSession);

    if (error || !paymentSession) {
      console.error('Error fetching payment session:', error);
      return NextResponse.json({ error: 'Payment session not found.' }, { status: 404 });
    }

    // Return the payment details. Be careful not to expose sensitive information.
    return NextResponse.json({
      amount: paymentSession.amount,
      currency: paymentSession.currency,
      merchantOrderId: paymentSession.merchant_order_id,
      customerEmail: paymentSession.customer_email,
      callbackUrl: paymentSession.callback_url,
      paymentSessionId: paymentSession.id,
      merchantPayoutWalletAddress: paymentSession.merchant_payout_wallet_address,
    });
  } catch (e) {
    console.error('An unexpected error occurred:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
