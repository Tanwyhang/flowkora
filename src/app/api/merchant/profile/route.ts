import { NextResponse } from 'next/server';
import { createApiRouteClient } from '../../../../lib/supabase/api';
import { z } from 'zod';

// Zod schema for updating the merchant profile
const updateProfileSchema = z.object({
  payout_wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format').optional(),
  webhook_url: z.string().url('Invalid URL').refine(s => s.startsWith('https'), 'Webhook URL must use HTTPS').optional(),
}).partial().strict(); // .partial() makes all fields optional, .strict() forbids extra fields

// GET handler to fetch merchant profile
export async function GET(request: Request) {
  const supabase = createApiRouteClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('merchants')
      .select('payout_wallet_address, webhook_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Get Profile Error:', error);
      return NextResponse.json({ error: 'Failed to fetch profile.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// PUT handler to update merchant profile
export async function PUT(request: Request) {
  const supabase = createApiRouteClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    // If there's no data to update, just return success
    if (Object.keys(validation.data).length === 0) {
        return NextResponse.json({ message: 'No data to update.' });
    }

    const { error } = await supabase
      .from('merchants')
      .update(validation.data)
      .eq('id', user.id);

    if (error) {
      console.error('Update Profile Error:', error);
      // The DB check constraints will handle invalid data, resulting in a specific error
      if (error.code === '23514') { // Check violation error code
        return NextResponse.json({ error: 'Invalid data format provided.', details: error.details }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully.' });
  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
