import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import { ChainProvider, ChainIcon, ChainName } from "thirdweb/react";
import { arbitrum } from 'thirdweb/chains';
import { Toaster } from '@/components/ui/sonner';
import { cookies } from 'next/headers';

export default async function MerchantLayout({children}: { children: React.ReactNode; }) {


  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  console.log("DEBUG: User in layout.tsx", user);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <ChainProvider chain={arbitrum}>
          {children}
        </ChainProvider>
        <Toaster />
      </main>
    </div>
  );
}
