import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { hasFeatureAccess } from '@/app/lib/subscriptions';
import { ensureOwnerTeamMember } from '@/app/lib/team';
import TeamList from '@/app/ui/team/team-list';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Team Members',
};

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Feature gate: only Business tier can access team management
  const hasAccess = await hasFeatureAccess(session.user.id, 'team_members');
  if (!hasAccess) {
    redirect('/dashboard/billing');
  }

  // Ensure the vendor has an owner record in team_members
  await ensureOwnerTeamMember(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Team Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Invite collaborators to help manage your store. Business tier includes up to 5 team members.
          </p>
        </div>
        <Link
          href="/dashboard/team/invite"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Invite Member</span>
        </Link>
      </div>

      <TeamList vendorId={session.user.id} />
    </div>
  );
}
