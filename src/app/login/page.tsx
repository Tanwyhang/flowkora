'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { BackgroundBeams } from "@/components/ui/shadcn-io/background-beams";
import { Card } from "@/components/ui/card";


import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/spinner';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("DEBUG: useEffect in LoginPage started");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("DEBUG: onAuthStateChange event", event);
      if (event === 'SIGNED_IN') {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("DEBUG: User after SIGNED_IN event", user);
        if (user) {
          router.refresh();
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("DEBUG: Setting isLoading to false due to SIGNED_OUT event");
        setIsLoading(false);
      }
    });

    // Initial check for session to set loading state correctly
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log("DEBUG: Initial getUser() result", user);
      if (user) {
        console.log("DEBUG: Initial user found, setting isLoading to false");
        setIsLoading(false);
        router.push('/dashboard'); // Redirect if user is already logged in
      } else {
        console.log("DEBUG: No initial user, setting isLoading to false");
        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <BackgroundBeams className="absolute inset-0 z-[-10]" />
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <BackgroundBeams className="absolute inset-0 z-[-10]" />
      <Card className="w-[320px] p-4" style={{ textAlign: 'center' }}>
        <h2>FlowKora Merchant Login</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          onlyThirdPartyProviders
          redirectTo={getURL()}
        />
      </Card>
    </div>
  );
}
