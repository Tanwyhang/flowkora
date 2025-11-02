'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { BackgroundBeams } from "@/components/ui/shadcn-io/background-beams";


import { useEffect } from 'react';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.refresh();
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const getURL = () => {
    let url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/';
    // Make sure to include a trailing '/' because of a bug in Supabase
    url = url.replace(/\/$/, '');
    return `${url}/auth/callback`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <BackgroundBeams className="absolute inset-0" />
      <div style={{ width: '320px' }}>
        <h2>FlowKora Merchant Login</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          onlyThirdPartyProviders
          redirectTo={getURL()}
        />
      </div>
    </div>
  );
}
