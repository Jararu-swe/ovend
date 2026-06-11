import { fetchTeamMembers } from '@/app/lib/team';
import { UsersIcon, ShieldCheckIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';
import RemoveTeamMemberButton from './remove-member-button';
import PermissionEditor from './permission-editor';
import Link from 'next/link';

export default async function TeamList({ vendorId }: { vendorId: string }) {
  const members = await fetchTeamMembers(vendorId);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center py-24">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex flex-col items-center justify-center mb-6">
          <UsersIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No team members yet</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          Invite team members to help manage your store, fulfill orders, and add products without giving them full ownership access.
        </p>
        <Link
          href="/dashboard/team/invite"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" />
          Invite Member
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {members.map((member) => {
              const roleIcon = member.role === 'owner' ? ShieldCheckIcon : 
                              member.role === 'admin' ? ShieldCheckIcon : UserIcon;
              const RoleIcon = roleIcon;
              
              return (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-medium text-sm">
                          {(member.user_name || member.user_email || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{member.user_name}</div>
                        <div className="text-sm text-slate-500">{member.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <RoleIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-900 capitalize">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.products && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Products
                        </span>
                      )}
                      {member.permissions.orders && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Orders
                        </span>
                      )}
                      {member.permissions.settings && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Settings
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.role !== 'owner' && (
                      <div className="flex items-center justify-end gap-1">
                        <PermissionEditor
                          memberId={member.id}
                          memberName={member.user_name}
                          currentRole={member.role}
                          currentPermissions={member.permissions}
                        />
                        <RemoveTeamMemberButton memberId={member.id} memberName={member.user_name} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
