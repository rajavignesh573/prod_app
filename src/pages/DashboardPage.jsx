import { memo, useMemo, useState } from 'react';

const controlClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

function statusTone(status) {
  if (status === 'overdue') return 'bg-rose-100 text-rose-700';
  if (status === 'due_today') return 'bg-amber-100 text-amber-700';
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700';
  return 'bg-blue-100 text-blue-700';
}

const DashboardPage = memo(function DashboardPage({
  tasks,
  allUsers = [],
  clientPayments = [],
  onUpsertClientPayment,
  onMarkClientPaymentPaid
}) {
  const clients = useMemo(() => [...new Set(tasks.map((task) => task.clientName).filter(Boolean))].sort(), [tasks]);
  const [selectedClient, setSelectedClient] = useState(clients[0] || '');
  const [savingClientName, setSavingClientName] = useState('');
  const [markingClientName, setMarkingClientName] = useState('');
  const [drafts, setDrafts] = useState({});

  const paymentByClient = useMemo(
    () => Object.fromEntries(clientPayments.map((row) => [row.clientName, row])),
    [clientPayments]
  );
  const userNameById = useMemo(
    () => Object.fromEntries(allUsers.map((user) => [user.id, user.name])),
    [allUsers]
  );

  const selectedClientTasks = useMemo(
    () => tasks.filter((task) => task.clientName === selectedClient),
    [selectedClient, tasks]
  );
  const userWise = useMemo(() => {
    const grouped = {};
    for (const task of selectedClientTasks) {
      const key = task.assigneeId;
      if (!grouped[key]) grouped[key] = { assigneeId: key, total: 0, yet: 0, inProgress: 0, completed: 0, tasks: [] };
      grouped[key].total += 1;
      grouped[key].tasks.push(task);
      if (task.status === 'YET_TO_WORK') grouped[key].yet += 1;
      if (task.status === 'IN_PROGRESS') grouped[key].inProgress += 1;
      if (task.status === 'COMPLETED') grouped[key].completed += 1;
    }
    return Object.values(grouped);
  }, [selectedClientTasks]);

  const paymentRows = useMemo(() => {
    return clients.map((clientName) => {
      const existing = paymentByClient[clientName];
      return {
        clientName,
        paymentCycleType: existing?.paymentCycleType || 'monthly',
        billingStartDate: existing?.billingStartDate || new Date().toISOString().slice(0, 10),
        dueDayRule: existing?.dueDayRule || { type: 'days_after_invoice', value: 0 },
        customCycleDays: existing?.customCycleDays ?? 30,
        lastPaidDate: existing?.lastPaidDate || '',
        amountPaid: existing?.amountPaid ?? 0,
        nextDueDate: existing?.nextDueDate || '-',
        status: existing?.status || 'upcoming',
        notes: existing?.notes || ''
      };
    });
  }, [clients, paymentByClient]);

  const summary = useMemo(() => {
    const dueToday = paymentRows.filter((row) => row.status === 'due_today').length;
    const overdue = paymentRows.filter((row) => row.status === 'overdue').length;
    const upcoming = paymentRows.filter((row) => row.status === 'upcoming').length;
    return { dueToday, overdue, upcoming };
  }, [paymentRows]);

  const getDraft = (row) =>
    drafts[row.clientName] || {
      paymentCycleType: row.paymentCycleType,
      billingStartDate: row.billingStartDate,
      dueDayRule: row.dueDayRule,
      customCycleDays: row.customCycleDays,
      lastPaidDate: row.lastPaidDate,
      amountPaid: row.amountPaid,
      notes: row.notes
    };

  const updateDraft = (clientName, patch) =>
    setDrafts((prev) => ({
      ...prev,
      [clientName]: {
        ...(prev[clientName] || {}),
        ...patch
      }
    }));

  const savePayment = async (clientName, row) => {
    const draft = getDraft(row);
    setSavingClientName(clientName);
    try {
      await onUpsertClientPayment(clientName, {
        paymentCycleType: draft.paymentCycleType,
        billingStartDate: draft.billingStartDate,
        dueDayRule: draft.dueDayRule,
        customCycleDays: draft.customCycleDays,
        lastPaidDate: draft.lastPaidDate || null,
        amountPaid: Number(draft.amountPaid || 0),
        notes: draft.notes || ''
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingClientName('');
    }
  };

  const markPaid = async (clientName, row) => {
    const draft = getDraft(row);
    setMarkingClientName(clientName);
    try {
      await onMarkClientPaymentPaid(clientName, {
        paidDate: new Date().toISOString().slice(0, 10),
        amountPaid: Number(draft.amountPaid || 0),
        notes: draft.notes || ''
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setMarkingClientName('');
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"><p className="text-xs text-amber-700">Due today</p><h3 className="text-2xl font-bold text-amber-700">{summary.dueToday}</h3></article>
        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm"><p className="text-xs text-rose-700">Overdue</p><h3 className="text-2xl font-bold text-rose-700">{summary.overdue}</h3></article>
        <article className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm"><p className="text-xs text-blue-700">Upcoming</p><h3 className="text-2xl font-bold text-blue-700">{summary.upcoming}</h3></article>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clients</p>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Click to view tasks</h3>
          <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
            {clients.map((clientName) => (
              <button
                key={clientName}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                  selectedClient === clientName
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedClient(clientName)}
              >
                {clientName}
              </button>
            ))}
            {!clients.length ? <p className="text-sm text-slate-400">No clients found in tasks.</p> : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Client task report</p>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">{selectedClient || 'Select a client'}</h3>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Yet to work</th>
                  <th className="px-3 py-2 text-left">In progress</th>
                  <th className="px-3 py-2 text-left">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userWise.map((row) => (
                  <tr key={row.assigneeId}>
                    <td className="px-3 py-2.5">{userNameById[row.assigneeId] || 'Unknown user'}</td>
                    <td className="px-3 py-2.5">{row.total}</td>
                    <td className="px-3 py-2.5">{row.yet}</td>
                    <td className="px-3 py-2.5">{row.inProgress}</td>
                    <td className="px-3 py-2.5">{row.completed}</td>
                  </tr>
                ))}
                {!userWise.length ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-400">No tasks for selected client.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment tracking and cycle tracking</p>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Client payment cycles</h3>
        <div className="overflow-auto">
          <table className="min-w-[1280px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">Client</th>
                <th className="px-3 py-2 text-left">Cycle type</th>
                <th className="px-3 py-2 text-left">Billing start</th>
                <th className="px-3 py-2 text-left">Due rule</th>
                <th className="px-3 py-2 text-left">Last paid</th>
                <th className="px-3 py-2 text-left">Amount paid</th>
                <th className="px-3 py-2 text-left">Next due</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Notes</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentRows.map((row) => {
                const draft = getDraft(row);
                return (
                  <tr key={row.clientName}>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{row.clientName}</td>
                    <td className="px-3 py-2.5">
                      <select className={controlClass} value={draft.paymentCycleType} onChange={(e) => updateDraft(row.clientName, { paymentCycleType: e.target.value })}>
                        <option value="weekly">weekly</option>
                        <option value="biweekly">biweekly</option>
                        <option value="monthly">monthly</option>
                        <option value="custom_days">custom days</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5"><input type="date" className={controlClass} value={draft.billingStartDate || ''} onChange={(e) => updateDraft(row.clientName, { billingStartDate: e.target.value })} /></td>
                    <td className="px-3 py-2.5">
                      <div className="grid gap-1">
                        <select className={controlClass} value={draft.dueDayRule?.type || 'days_after_invoice'} onChange={(e) => updateDraft(row.clientName, { dueDayRule: { ...(draft.dueDayRule || {}), type: e.target.value } })}>
                          <option value="fixed_day">fixed day</option>
                          <option value="days_after_invoice">days after invoice</option>
                        </select>
                        <input type="number" min="0" className={controlClass} value={draft.dueDayRule?.value ?? 0} onChange={(e) => updateDraft(row.clientName, { dueDayRule: { ...(draft.dueDayRule || {}), value: Number(e.target.value) } })} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><input type="date" className={controlClass} value={draft.lastPaidDate || ''} onChange={(e) => updateDraft(row.clientName, { lastPaidDate: e.target.value })} /></td>
                    <td className="px-3 py-2.5"><input type="number" min="0" step="0.01" className={controlClass} value={draft.amountPaid ?? 0} onChange={(e) => updateDraft(row.clientName, { amountPaid: Number(e.target.value) })} /></td>
                    <td className="px-3 py-2.5 text-slate-700">{row.nextDueDate}</td>
                    <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>{row.status}</span></td>
                    <td className="px-3 py-2.5"><input className={controlClass} value={draft.notes || ''} onChange={(e) => updateDraft(row.clientName, { notes: e.target.value })} /></td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" disabled={savingClientName === row.clientName} onClick={() => savePayment(row.clientName, row)}>
                          {savingClientName === row.clientName ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700" disabled={markingClientName === row.clientName} onClick={() => markPaid(row.clientName, row)}>
                          {markingClientName === row.clientName ? 'Marking...' : 'Mark paid'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!paymentRows.length ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-slate-400">No clients available for payment tracking.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
});

export default DashboardPage;
