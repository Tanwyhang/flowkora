'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UserPortalPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">User Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-700">
            Welcome to the FlowKora User Portal! This section is under development.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="w-full py-3 text-lg"
          >
            Go Back to Landing Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
