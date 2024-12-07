'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function EditStudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Edit student error:', error);
  }, [error]);

  return (
    <main className="container mx-auto py-6">
      <div className="rounded-lg border border-destructive/50 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <div className="space-x-4">
          <Button onClick={() => router.push('/students')}>
            Back to Students
          </Button>
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </main>
  );
} 