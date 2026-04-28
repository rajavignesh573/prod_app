function AccountSettingsPage({ currentUser }) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Account</p>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Account Settings</h3>
        <p className="mt-1 text-sm text-slate-500">Profile and access details for your current session.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser?.name || '-'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser?.role || '-'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser?.email || '-'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 text-sm text-slate-800">{currentUser?.isActive === false ? 'Disabled' : 'Active'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccountSettingsPage;
