import { auth } from '@/auth';
import { sql } from '@/app/lib/db';
import SettingsForm from '@/app/ui/profile/settings-form';

export default async function SettingsPage() {
  const session = await auth();
  const customerId = session?.user?.id;

  if (!customerId) return null;

  const [customer] = await sql`
    SELECT name, email, whatsapp_number, delivery_address, delivery_latitude, delivery_longitude, delivery_address_details
    FROM users 
    WHERE id = ${customerId}
    LIMIT 1
  `;

  return (
    <main className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="mt-1 text-slate-500">Update your details for faster checkout.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 md:p-8">
        <SettingsForm customer={customer as any} customerId={customerId} />
      </div>
    </main>
  );
}
