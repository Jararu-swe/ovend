import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import TeamList from '@/app/ui/team/team-list';
import { TeamListSkeleton } from '@/app/ui/skeletons';

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
        <Link
          href="/dashboard/team/invite"
          className="flex h-10 items-center rounded-xl bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
        >
          <span className="hidden md:block">Invite Member</span>
          <PlusIcon className="h-5 md:ml-2" />
        </Link>
      </div>
      <Suspense fallback={<TeamListSkeleton />}>
        <TeamList vendorId={session.user.id} />
      </Suspense>
    </div>
  );
}
