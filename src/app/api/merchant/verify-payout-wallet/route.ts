import { NextResponse } from 'next/server';
import { createApiRouteClient } from '../../../../lib/supabase/api';
import { z } from 'zod';
// We need ethers for message verification
import { ethers } from 'ethers';

// Zod schema for input validation
const verifyWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'),
  signedMessage: z.string(),
  originalMessage: z.string(),
});

export async function POST(request: Request) {
  const supabase = await createApiRouteClient();

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("DEBUG: User in verify-payout-wallet", user);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate the request body
    const body = await request.json();
    const validation = verifyWalletSchema.safeParse(body);
    console.log("DEBUG: Validation data in verify-payout-wallet", validation.data);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { walletAddress, signedMessage, originalMessage } = validation.data;

    // 3. Recover the signer from the signed message
    let recoveredAddress;
    try {
      recoveredAddress = ethers.utils.verifyMessage(originalMessage, signedMessage);
    } catch (e) {
      console.error('Ethers verification error:', e);
      return NextResponse.json({ error: 'Invalid signature or message.' }, { status: 400 });
    }

    // 4. Compare the recovered address with the provided walletAddress
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Signature does not match the provided wallet address.' }, { status: 400 });
    }

    // 5. Update the merchant's profile in the database
    const { error: updateError } = await supabase
      .from('merchants')
      .update({
        payout_wallet_address: walletAddress, // Ensure this is also updated/set
        is_payout_wallet_verified: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      return NextResponse.json({ error: 'Failed to update merchant profile.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Wallet successfully verified.' });

  } catch (e) {
    console.error('Verify Payout Wallet Error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
