export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your store profile and account preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* Store profile card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Store Profile</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="store-name" className="block text-sm font-medium text-slate-700 mb-1">
                Store Name
              </label>
              <input
                id="store-name"
                type="text"
                placeholder="e.g. Amaka Threads"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 mb-1">
                WhatsApp Number
              </label>
              <input
                id="whatsapp"
                type="tel"
                placeholder="+234 801 234 5678"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            <div>
              <label htmlFor="store-slug" className="block text-sm font-medium text-slate-700 mb-1">
                Store URL Slug
              </label>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
                <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500 border-r border-slate-200">
                  ovend.app/s/
                </span>
                <input
                  id="store-slug"
                  type="text"
                  placeholder="your-store"
                  className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              id="save-profile-btn"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
            >
              Save changes
            </button>
          </div>
        </div>

        {/* Account section */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Account</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="account-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="account-email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              id="update-account-btn"
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
            >
              Update account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
