import { NextResponse } from 'next/server';
import { createApiRouteClient } from '../../../../lib/supabase/api';
import { z } from 'zod';
import * as crypto from 'crypto';

const createApiKeySchema = z.object({
  name: z.string().optional(),
});

export async function GET(request: Request) {
  const supabase = await createApiRouteClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("DEBUG: User in api-keys/GET", user);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, status, created_at, last_used_at, expires_at')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get API Keys Error:', error);
      return NextResponse.json({ error: 'Failed to fetch API keys.' }, { status: 500 });
    }

    return NextResponse.json(apiKeys);
  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createApiRouteClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("DEBUG: User in api-keys/POST", user);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = createApiKeySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const randomBytes = crypto.randomBytes(24);
    const keySecret = randomBytes.toString('hex');
    const keyPrefix = 'fk_live_';
    const fullApiKey = `${keyPrefix}${keySecret}`;

    const keyHash = crypto.createHash('sha256').update(fullApiKey).digest('hex');

    const { data: newKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        merchant_id: user.id,
        name: validation.data.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
      })
      .select('id, name, key_prefix, created_at')
      .single();

    if (insertError) {
      console.error('Create API Key Error:', insertError);
      return NextResponse.json({ error: 'Failed to create API key.' }, { status: 500 });
    }

    return NextResponse.json({ ...newKey, fullApiKey });

  } catch (e) {
    console.error('Create API Key Unhandled Error:', e);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}