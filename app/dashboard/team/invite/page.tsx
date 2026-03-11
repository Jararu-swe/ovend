import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import InviteTeamForm from '@/app/ui/team/invite-form';

export default async function InviteTeamPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Invite Team Member</h1>
      <InviteTeamForm vendorId={session.user.id} />
    </div>
  );
}
