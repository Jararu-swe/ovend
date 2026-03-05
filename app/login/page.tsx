import LoginForm from '@/app/ui/login-form';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}

