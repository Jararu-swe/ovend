import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
