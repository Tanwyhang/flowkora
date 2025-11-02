'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
  { href: '/api-keys', label: 'API Keys' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Ensure server components are re-evaluated
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-100 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">FlowKora</h1>
      <nav className="flex flex-col space-y-2">
        {navLinks.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link href={link.href} key={link.href}>
              <span className={`px-4 py-2 rounded-md block ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
