import { Suspense } from 'react';
import SignupForm from '@/app/ui/customer/signup-form';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
        </div>
      }>
        <SignupForm />
      </Suspense>
    </main>
  );
}
