'use client';

import { removeTeamMemberAction } from '@/app/lib/actions';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';

export default function RemoveTeamMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const removeWithId = removeTeamMemberAction.bind(null, memberId);
  const [state, formAction] = useActionState(removeWithId, { message: null, errors: {} });

  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm(`Remove ${memberName} from your team?`)) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="text-red-600 hover:text-red-900 transition"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
