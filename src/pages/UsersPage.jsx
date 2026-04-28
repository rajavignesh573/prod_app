import { memo, useCallback, useState } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

const UserRow = memo(function UserRow({ user, activeUserId, deletingUserId, onSetUserAccess, onDeleteUser }) {
  return (
    <tr>
      <td className="px-3 py-2">{user.name}</td>
      <td className="px-3 py-2">{user.email || '-'}</td>
      <td className="px-3 py-2">{user.role}</td>
      <td className="px-3 py-2">{user.isActive ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span> : <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">Disabled</span>}</td>
      <td className="px-3 py-2 text-right">
        <div className="flex justify-end gap-2">
          <button
            disabled={user.id === activeUserId}
            onClick={() => onSetUserAccess(user.id, !user.isActive)}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {user.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            disabled={user.id === activeUserId || deletingUserId === user.id}
            onClick={() => onDeleteUser(user.id)}
            className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
});

function UsersPage({ users, activeUser, onCreateUser, onSetUserAccess, onDeleteUser }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState('');

  if (activeUser.role !== 'admin') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Users</h3>
        <p className="mt-2 text-sm text-slate-600">Only admin can view and manage users.</p>
      </section>
    );
  }

  const submit = useCallback(async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onCreateUser(form);
      setForm({ name: '', email: '', role: 'user', password: '' });
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }, [form, onCreateUser]);

  const handleDeleteUser = useCallback(async (userId) => {
    const confirmed = window.confirm('Delete this user? This cannot be undone.');
    if (!confirmed) return;
    setDeletingUserId(userId);
    try {
      await onDeleteUser(userId);
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingUserId('');
    }
  }, [onDeleteUser]);

  const renderUserRow = useCallback((user) => (
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <tbody>
        <UserRow
          user={user}
          activeUserId={activeUser.id}
          deletingUserId={deletingUserId}
          onSetUserAccess={onSetUserAccess}
          onDeleteUser={handleDeleteUser}
        />
      </tbody>
    </table>
  ), [activeUser.id, deletingUserId, handleDeleteUser, onSetUserAccess]);

  return (
    <section className="space-y-4">
      <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={submit}>
        <h3 className="text-lg font-semibold text-slate-900">Create User</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className={controlClass} placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className={controlClass} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <select className={controlClass} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input className={controlClass} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        </div>
        <button disabled={saving} className="mt-3 h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
          {saving ? 'Creating...' : 'Create user'}
        </button>
      </form>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3"><h3 className="text-lg font-semibold text-slate-900">Users</h3></div>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-left">Access</th><th className="px-3 py-2 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.length > 50 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <VirtualizedList
                      items={users}
                      estimateSize={46}
                      height={560}
                      renderItem={renderUserRow}
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    activeUserId={activeUser.id}
                    deletingUserId={deletingUserId}
                    onSetUserAccess={onSetUserAccess}
                    onDeleteUser={handleDeleteUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default UsersPage;
