import { memo, useCallback, useMemo, useState } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const initialFilters = {
  category: 'ALL',
  assigneeId: 'ALL',
  progress: 'ALL',
  startFrom: '',
  endTo: '',
  sortBy: 'created_desc'
};

function daysLeft(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function inDateRange(value, from, to) {
  if (!value) return false;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return false;
  if (from && ts < new Date(from).getTime()) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (ts > end.getTime()) return false;
  }
  return true;
}

const GoalCard = memo(function GoalCard({ goal, assigneeName, canDelete, deleting, onDeleteGoal, onOpenProgress, onOpenLogs }) {
  const left = goal.daysLeft ?? daysLeft(goal.endDate);
  const [showInfo, setShowInfo] = useState(false);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="line-clamp-1 text-lg font-semibold text-slate-900">{goal.title}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{goal.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Goal info"
            onClick={() => setShowInfo((prev) => !prev)}
            className="grid h-6 w-6 place-items-center rounded-full border border-slate-300 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
          >
            i
          </button>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{goal.percentage}%</span>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${goal.percentage}%` }} /></div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">{goal.category || '-'}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}</span>
        <span className={`rounded-full px-2 py-1 font-semibold ${left < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {left < 0 ? `${Math.abs(left)} days overdue` : `${left} days left`}
        </span>
      </div>
      {showInfo ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p>Assignee: {assigneeName}</p>
          <p>Assigned by: {goal.assignedBy}</p>
          <p>Created: {new Date(goal.createdAt).toLocaleString()}</p>
        </div>
      ) : null}
      {goal.notes ? <p className="mt-2 text-xs text-slate-500">Notes: {goal.notes}</p> : null}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenLogs(goal.id)}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View logs
            </button>
            <button onClick={() => onOpenProgress(goal.id, goal.percentage)} className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700">Add progress</button>
          </div>
        </div>
        <p className="text-xs text-slate-500">{goal.progressLogs?.length || 0} updates</p>
      </div>
      <div className="mt-3 flex justify-end">
        {canDelete ? (
          <button
            type="button"
            disabled={deleting}
            className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
            onClick={() => onDeleteGoal(goal.id)}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">Only creator can delete</span>
        )}
      </div>
    </article>
  );
});

const GoalTableRow = memo(function GoalTableRow({
  goal,
  canDelete,
  deleting,
  onDeleteGoal,
  onOpenProgress,
  onOpenLogs,
  onOpenInfo
}) {
  const left = goal.daysLeft ?? daysLeft(goal.endDate);
  return (
    <tr>
      <td className="px-3 py-2.5">
        <p className="font-medium text-slate-800">{goal.title}</p>
        <p className="line-clamp-1 text-xs text-slate-500">{goal.description}</p>
      </td>
      <td className="px-3 py-2.5 text-sm text-slate-600">{goal.category || '-'}</td>
      <td className="px-3 py-2.5 text-sm text-slate-600">{new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}</td>
      <td className="px-3 py-2.5">
        <div className="w-28">
          <div className="h-1.5 rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-slate-900" style={{ width: `${goal.percentage}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-600">{goal.percentage}%</p>
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm">
        <span className={left < 0 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-700'}>
          {left < 0 ? `${Math.abs(left)} overdue` : `${left} left`}
        </span>
      </td>
      <td className="px-3 py-2.5 text-sm text-slate-600">{goal.progressLogs?.length || 0}</td>
      <td className="px-3 py-2.5 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onOpenInfo(goal.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">Info</button>
          <button type="button" onClick={() => onOpenLogs(goal.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">Logs</button>
          <button type="button" onClick={() => onOpenProgress(goal.id, goal.percentage)} className="rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-700">Progress</button>
          {canDelete ? (
            <button type="button" disabled={deleting} onClick={() => onDeleteGoal(goal.id)} className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
});

function GoalsPage({ goals, activeUser, allUsers, addons, onCreateGoal, onAddGoalProgress, onDeleteGoal }) {
  const [viewMode, setViewMode] = useState('cards');
  const [showCreate, setShowCreate] = useState(false);
  const [showProgressGoalId, setShowProgressGoalId] = useState('');
  const [showLogsGoalId, setShowLogsGoalId] = useState('');
  const [showInfoGoalId, setShowInfoGoalId] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: addons?.goalCategories?.[0]?.value || 'General',
    startDate: '',
    endDate: '',
    assigneeId: activeUser?.id || '',
    percentage: 0,
    notes: ''
  });

  const [progressForm, setProgressForm] = useState({ workNote: '', percentage: 0 });

  const visibleGoals = useMemo(() => {
    if (!activeUser) return [];
    return activeUser.role === 'admin'
      ? goals
      : goals.filter((goal) => goal.assigneeId === activeUser.id);
  }, [activeUser, goals]);

  const filteredGoals = useMemo(() => {
    let list = [...visibleGoals];
    if (filters.category !== 'ALL') list = list.filter((goal) => goal.category === filters.category);
    if (filters.assigneeId !== 'ALL') list = list.filter((goal) => goal.assigneeId === filters.assigneeId);
    if (filters.progress === 'completed') list = list.filter((goal) => goal.percentage >= 100);
    if (filters.progress === 'in_progress') list = list.filter((goal) => goal.percentage > 0 && goal.percentage < 100);
    if (filters.progress === 'not_started') list = list.filter((goal) => goal.percentage === 0);
    if (filters.startFrom || filters.endTo) {
      list = list.filter((goal) => inDateRange(goal.startDate, filters.startFrom, filters.endTo));
    }
    if (filters.sortBy === 'created_desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.sortBy === 'created_asc') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (filters.sortBy === 'end_asc') list.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    if (filters.sortBy === 'progress_desc') list.sort((a, b) => b.percentage - a.percentage);
    if (filters.sortBy === 'title_asc') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [filters, visibleGoals]);

  const summary = useMemo(() => {
    const total = filteredGoals.length;
    const completed = filteredGoals.filter((goal) => goal.percentage >= 100).length;
    const avg = total
      ? Math.round(filteredGoals.reduce((acc, goal) => acc + goal.percentage, 0) / total)
      : 0;
    return { total, completed, avg };
  }, [filteredGoals]);

  const userNameMap = useMemo(() => Object.fromEntries(allUsers.map((user) => [user.id, user.name])), [allUsers]);

  const resetGoalForm = useCallback(() => {
    setGoalForm({
      title: '',
      description: '',
      category: addons?.goalCategories?.[0]?.value || 'General',
      startDate: '',
      endDate: '',
      assigneeId: activeUser?.id || '',
      percentage: 0,
      notes: ''
    });
  }, [activeUser?.id, addons?.goalCategories]);

  const handleCreate = useCallback(async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await onCreateGoal(goalForm);
      resetGoalForm();
      setShowCreate(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  }, [goalForm, onCreateGoal, resetGoalForm]);

  const handleAddProgress = useCallback(async (event) => {
    event.preventDefault();
    if (!showProgressGoalId) return;
    setUpdating(true);
    try {
      await onAddGoalProgress(showProgressGoalId, progressForm);
      setProgressForm({ workNote: '', percentage: 0 });
      setShowProgressGoalId('');
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  }, [onAddGoalProgress, progressForm, showProgressGoalId]);

  const openProgress = useCallback((goalId, percentage) => {
    setShowProgressGoalId(goalId);
    setProgressForm({ workNote: '', percentage });
  }, []);
  const openLogs = useCallback((goalId) => {
    setShowLogsGoalId(goalId);
  }, []);
  const selectedLogsGoal = useMemo(
    () => visibleGoals.find((goal) => goal.id === showLogsGoalId) || null,
    [showLogsGoalId, visibleGoals]
  );
  const selectedInfoGoal = useMemo(
    () => visibleGoals.find((goal) => goal.id === showInfoGoalId) || null,
    [showInfoGoalId, visibleGoals]
  );

  const handleDelete = useCallback(async (goalId) => {
    const confirmed = window.confirm('Delete this goal? This action cannot be undone.');
    if (!confirmed) return;
    setDeletingGoalId(goalId);
    try {
      await onDeleteGoal(goalId);
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingGoalId('');
    }
  }, [onDeleteGoal]);

  const renderGoalCard = useCallback((goal) => (
    <GoalCard
      goal={goal}
      assigneeName={userNameMap[goal.assigneeId] || '-'}
      canDelete={goal.createdById === activeUser?.id}
      deleting={deletingGoalId === goal.id}
      onDeleteGoal={handleDelete}
      onOpenProgress={openProgress}
      onOpenLogs={openLogs}
    />
  ), [activeUser?.id, deletingGoalId, handleDelete, openLogs, openProgress, userNameMap]);
  const clearFilters = useCallback(() => setFilters(initialFilters), []);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Goals</p>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Goal tracker</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                Table
              </button>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              New goal
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total goals</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">Completed</p>
            <p className="text-2xl font-bold text-emerald-700">{summary.completed}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-700">Average progress</p>
            <p className="text-2xl font-bold text-blue-700">{summary.avg}%</p>
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
            <div><label className={labelClass}>Category</label><select className={controlClass} value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}><option value="ALL">All</option>{(addons?.goalCategories || []).map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}</select></div>
            <div><label className={labelClass}>Assignee</label><select className={controlClass} value={filters.assigneeId} onChange={(e) => setFilters((p) => ({ ...p, assigneeId: e.target.value }))}><option value="ALL">All</option>{allUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>
            <div><label className={labelClass}>Progress</label><select className={controlClass} value={filters.progress} onChange={(e) => setFilters((p) => ({ ...p, progress: e.target.value }))}><option value="ALL">All</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></div>
            <div><label className={labelClass}>Start from</label><input type="date" className={controlClass} value={filters.startFrom} onChange={(e) => setFilters((p) => ({ ...p, startFrom: e.target.value }))} /></div>
            <div><label className={labelClass}>End to</label><input type="date" className={controlClass} value={filters.endTo} onChange={(e) => setFilters((p) => ({ ...p, endTo: e.target.value }))} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Sort</label><select className={controlClass} value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}><option value="created_desc">Created - newest first</option><option value="created_asc">Created - oldest first</option><option value="end_asc">End date - nearest first</option><option value="progress_desc">Progress - high to low</option><option value="title_asc">Title - A to Z</option></select></div>
            <div className="flex items-end"><button className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700" onClick={clearFilters}>Clear filters</button></div>
          </div>
        </details>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredGoals.length > 50 ? (
            <div className="md:col-span-2 xl:col-span-3">
              <VirtualizedList items={filteredGoals} estimateSize={290} height={650} renderItem={renderGoalCard} />
            </div>
          ) : (
            filteredGoals.map((goal) => <div key={goal.id}>{renderGoalCard(goal)}</div>)
          )}

          {!filteredGoals.length && (
            <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No goals yet. Create your first goal to start tracking progress.
            </article>
          )}
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Goal</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Dates</th>
                  <th className="px-3 py-2 text-left">Progress</th>
                  <th className="px-3 py-2 text-left">Timeline</th>
                  <th className="px-3 py-2 text-left">Logs</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGoals.map((goal) => (
                  <GoalTableRow
                    key={goal.id}
                    goal={goal}
                    canDelete={goal.createdById === activeUser?.id}
                    deleting={deletingGoalId === goal.id}
                    onDeleteGoal={handleDelete}
                    onOpenProgress={openProgress}
                    onOpenLogs={openLogs}
                    onOpenInfo={setShowInfoGoalId}
                  />
                ))}
                {!filteredGoals.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No goals yet. Create your first goal to start tracking progress.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <form className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onSubmit={handleCreate}>
            <h3 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">New goal</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Title</label>
                <input required className={controlClass} value={goalForm.title} onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Assignee</label>
                <select required disabled={activeUser?.role === 'user'} className={`${controlClass} disabled:bg-slate-100`} value={activeUser?.role === 'user' ? activeUser.id : goalForm.assigneeId} onChange={(e) => setGoalForm((p) => ({ ...p, assigneeId: e.target.value }))}>
                  {(activeUser?.role === 'admin' ? allUsers : [activeUser]).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea required className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" value={goalForm.description} onChange={(e) => setGoalForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  required
                  className={controlClass}
                  value={goalForm.category}
                  onChange={(e) => setGoalForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {(addons?.goalCategories?.length ? addons.goalCategories : [{ value: 'General' }]).map((item) => (
                    <option key={item.value} value={item.value}>{item.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Start date</label>
                <input type="date" required className={controlClass} value={goalForm.startDate} onChange={(e) => setGoalForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>End date</label>
                <input type="date" required className={controlClass} value={goalForm.endDate} onChange={(e) => setGoalForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Percentage (0-100)</label>
                <input type="range" min="0" max="100" className="w-full" value={goalForm.percentage} onChange={(e) => setGoalForm((p) => ({ ...p, percentage: Number(e.target.value) }))} />
                <p className="text-xs text-slate-500">{goalForm.percentage}%</p>
              </div>
              <div>
                <label className={labelClass}>Notes (optional)</label>
                <input className={controlClass} value={goalForm.notes} onChange={(e) => setGoalForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" disabled={creating} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">{creating ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {showProgressGoalId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <form className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onSubmit={handleAddProgress}>
            <h3 className="mb-4 text-xl font-semibold tracking-tight text-slate-900">Add progress</h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Work done</label>
                <textarea required className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" value={progressForm.workNote} onChange={(e) => setProgressForm((p) => ({ ...p, workNote: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Percentage</label>
                <input type="range" min="0" max="100" className="w-full" value={progressForm.percentage} onChange={(e) => setProgressForm((p) => ({ ...p, percentage: Number(e.target.value) }))} />
                <p className="text-xs text-slate-500">{progressForm.percentage}%</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setShowProgressGoalId('')}>Cancel</button>
              <button type="submit" disabled={updating} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">{updating ? 'Saving...' : 'Save progress'}</button>
            </div>
          </form>
        </div>
      )}

      {selectedLogsGoal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Progress logs</p>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">{selectedLogsGoal.title}</h3>
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setShowLogsGoalId('')}
              >
                Close
              </button>
            </div>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              {selectedLogsGoal.progressLogs?.length ? selectedLogsGoal.progressLogs.map((log) => (
                <div key={log.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <p>{log.workNote}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{log.createdBy} • {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No progress updates yet.</p>}
            </div>
          </div>
        </div>
      )}

      {selectedInfoGoal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Goal info</h3>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setShowInfoGoalId('')}
              >
                Close
              </button>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>Assignee: {userNameMap[selectedInfoGoal.assigneeId] || '-'}</p>
              <p>Assigned by: {selectedInfoGoal.assignedBy}</p>
              <p>Created: {new Date(selectedInfoGoal.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GoalsPage;
