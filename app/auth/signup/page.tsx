import { SignUpForm } from "@/components/auth/signup-form";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <SignUpForm />
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link 
          href="/auth/signin" 
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
} 