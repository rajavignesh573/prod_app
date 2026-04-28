import { memo, useCallback, useMemo, useState } from 'react';

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const initialFilters = {
  category: 'ALL',
  assigneeId: 'ALL',
  todayStatus: 'ALL',
  sortBy: 'created_desc'
};

const RoutineTableRow = memo(function RoutineTableRow({ routine, assigneeName, canToggle, canDelete, deleting, onToggleRoutine, onDeleteRoutine, onOpenInfo, onOpenLogs }) {
  return (
    <tr>
      <td className="px-3 py-2.5">
        <p className="font-medium text-slate-800">{routine.title}</p>
        <p className="line-clamp-1 text-xs text-slate-500">{routine.description}</p>
      </td>
      <td className="px-3 py-2.5 text-sm text-slate-600">{routine.category}</td>
      <td className="px-3 py-2.5 text-sm text-slate-600">{assigneeName}</td>
      <td className="px-3 py-2.5 text-sm text-slate-600">{routine.doneDays} / {routine.totalTrackedDays}</td>
      <td className="px-3 py-2.5">
        <div className="w-28">
          <div className="h-1.5 rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-slate-900" style={{ width: `${routine.completionPercentage}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-600">{routine.completionPercentage}%</p>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${routine.doneToday ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {routine.doneToday ? 'Done' : 'Pending'}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onOpenInfo(routine.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">Info</button>
          <button type="button" onClick={() => onOpenLogs(routine.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">Logs</button>
          {canToggle ? (
            <button
              type="button"
              onClick={() => onToggleRoutine(routine.id, !routine.doneToday)}
              className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700"
            >
              {routine.doneToday ? 'Mark pending' : 'Mark done'}
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => onDeleteRoutine(routine.id)}
              className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
});

function DailyRoutinePage({ routines, activeUser, allUsers, addons, onCreateRoutine, onToggleRoutine, onDeleteRoutine }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showInfoRoutineId, setShowInfoRoutineId] = useState('');
  const [showLogsRoutineId, setShowLogsRoutineId] = useState('');
  const [deletingRoutineId, setDeletingRoutineId] = useState('');
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState({
    category: addons.routineCategories[0]?.value || '',
    title: '',
    description: '',
    assigneeId: activeUser?.id || ''
  });

  const visibleRoutines = useMemo(() => {
    if (!activeUser) return [];
    return activeUser.role === 'admin'
      ? routines
      : routines.filter((routine) => routine.assigneeId === activeUser.id);
  }, [activeUser, routines]);

  const userNameMap = useMemo(() => Object.fromEntries(allUsers.map((user) => [user.id, user.name])), [allUsers]);
  const filteredRoutines = useMemo(() => {
    let list = [...visibleRoutines];
    if (filters.category !== 'ALL') list = list.filter((routine) => routine.category === filters.category);
    if (filters.assigneeId !== 'ALL') list = list.filter((routine) => routine.assigneeId === filters.assigneeId);
    if (filters.todayStatus === 'done') list = list.filter((routine) => routine.doneToday);
    if (filters.todayStatus === 'pending') list = list.filter((routine) => !routine.doneToday);
    if (filters.sortBy === 'created_desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.sortBy === 'created_asc') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (filters.sortBy === 'completion_desc') list.sort((a, b) => b.completionPercentage - a.completionPercentage);
    if (filters.sortBy === 'done_days_desc') list.sort((a, b) => b.doneDays - a.doneDays);
    if (filters.sortBy === 'title_asc') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [filters, visibleRoutines]);

  const doneCount = filteredRoutines.filter((routine) => routine.doneToday).length;
  const completion = filteredRoutines.length ? Math.round((doneCount / filteredRoutines.length) * 100) : 0;

  const handleCreate = useCallback(async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await onCreateRoutine(form);
      setForm({
        category: addons.routineCategories[0]?.value || '',
        title: '',
        description: '',
        assigneeId: activeUser?.id || ''
      });
      setShowCreate(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  }, [activeUser?.id, addons.routineCategories, form, onCreateRoutine]);

  const selectedInfoRoutine = useMemo(
    () => visibleRoutines.find((routine) => routine.id === showInfoRoutineId) || null,
    [showInfoRoutineId, visibleRoutines]
  );
  const selectedLogsRoutine = useMemo(
    () => visibleRoutines.find((routine) => routine.id === showLogsRoutineId) || null,
    [showLogsRoutineId, visibleRoutines]
  );

  const handleDeleteRoutine = useCallback(async (routineId) => {
    const confirmed = window.confirm('Delete this routine? This action cannot be undone.');
    if (!confirmed) return;
    setDeletingRoutineId(routineId);
    try {
      await onDeleteRoutine(routineId);
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingRoutineId('');
    }
  }, [onDeleteRoutine]);
  const clearFilters = useCallback(() => setFilters(initialFilters), []);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Daily routine</p>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Routine checklist</h3>
          </div>
          <button
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={() => setShowCreate(true)}
          >
            New routine
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total routines</p>
            <p className="text-2xl font-bold text-slate-900">{visibleRoutines.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">Done today</p>
            <p className="text-2xl font-bold text-emerald-700">{doneCount}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-700">Completion</p>
            <p className="text-2xl font-bold text-blue-700">{completion}%</p>
          </div>
        </div>
        <details className="group mt-4 rounded-xl border border-slate-200">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
            <span className="flex items-center justify-between">
              <span>Filter & sort</span>
              <svg className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.937a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
            </span>
          </summary>
          <div className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-4">
            <div><label className={labelClass}>Category</label><select className={controlClass} value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}><option value="ALL">All</option>{addons.routineCategories.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}</select></div>
            <div><label className={labelClass}>Assignee</label><select className={controlClass} value={filters.assigneeId} onChange={(e) => setFilters((p) => ({ ...p, assigneeId: e.target.value }))}><option value="ALL">All</option>{allUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>
            <div><label className={labelClass}>Today status</label><select className={controlClass} value={filters.todayStatus} onChange={(e) => setFilters((p) => ({ ...p, todayStatus: e.target.value }))}><option value="ALL">All</option><option value="done">Done</option><option value="pending">Pending</option></select></div>
            <div className="md:col-span-2"><label className={labelClass}>Sort</label><select className={controlClass} value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}><option value="created_desc">Created - newest first</option><option value="created_asc">Created - oldest first</option><option value="completion_desc">Completion - high to low</option><option value="done_days_desc">Done days - high to low</option><option value="title_asc">Title - A to Z</option></select></div>
            <div className="flex items-end"><button className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700" onClick={clearFilters}>Clear filters</button></div>
          </div>
        </details>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">Routine</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Assignee</th>
                <th className="px-3 py-2 text-left">Done days</th>
                <th className="px-3 py-2 text-left">Completion</th>
                <th className="px-3 py-2 text-left">Today</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutines.map((routine) => (
                <RoutineTableRow
                  key={routine.id}
                  routine={routine}
                  assigneeName={userNameMap[routine.assigneeId] || '-'}
                  canToggle={activeUser?.role === 'admin' || routine.assigneeId === activeUser?.id}
                  canDelete={routine.createdById === activeUser?.id}
                  deleting={deletingRoutineId === routine.id}
                  onToggleRoutine={onToggleRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
                  onOpenInfo={setShowInfoRoutineId}
                  onOpenLogs={setShowLogsRoutineId}
                />
              ))}
              {!filteredRoutines.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No routines yet. Create recurring daily activities for consistency.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <form className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onSubmit={handleCreate}>
            <h3 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">New daily routine</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <select className={controlClass} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {addons.routineCategories.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Assignee</label>
                <select required disabled={activeUser?.role === 'user'} className={`${controlClass} disabled:bg-slate-100`} value={activeUser?.role === 'user' ? activeUser.id : form.assigneeId} onChange={(e) => setForm((p) => ({ ...p, assigneeId: e.target.value }))}>
                  {(activeUser?.role === 'admin' ? allUsers : [activeUser]).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input required className={controlClass} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea required className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" disabled={creating} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">{creating ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {selectedInfoRoutine && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Routine info</h3>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setShowInfoRoutineId('')}
              >
                Close
              </button>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>Assignee: {userNameMap[selectedInfoRoutine.assigneeId] || '-'}</p>
              <p>Assigned by: {selectedInfoRoutine.assignedBy}</p>
              <p>Created: {new Date(selectedInfoRoutine.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {selectedLogsRoutine && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Routine logs</p>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">{selectedLogsRoutine.title}</h3>
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setShowLogsRoutineId('')}
              >
                Close
              </button>
            </div>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              {selectedLogsRoutine.routineLogs?.length ? selectedLogsRoutine.routineLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <p>Date: {new Date(log.doneDate).toLocaleDateString()}</p>
                  <p>Status: {log.isDone ? 'Done' : 'Pending'}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{log.updatedBy} • {new Date(log.updatedAt).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No logs captured yet.</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DailyRoutinePage;
