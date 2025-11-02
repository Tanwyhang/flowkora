import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createApiRouteClient } from '@/lib/supabase/api';
import { z } from 'zod';

const updateApiKeySchema = z.object({
  name: z.string().optional(),
  status: z.enum(['active', 'revoked']).optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createApiRouteClient();
  const { id } = params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = updateApiKeySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { error } = await supabase
      .from('api_keys')
      .update(validation.data)
      .eq('id', id)
      .eq('merchant_id', user.id);

    if (error) {
      console.error('Update API Key Error:', error);
      return NextResponse.json({ error: 'Failed to update API key.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'API key updated successfully.' });
  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createApiRouteClient();
  const { id } = params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('merchant_id', user.id);

    if (error) {
      console.error('Delete API Key Error:', error);
      return NextResponse.json({ error: 'Failed to delete API key.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'API key deleted successfully.' });
  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
