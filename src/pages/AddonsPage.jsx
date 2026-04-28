import { memo, useCallback, useMemo, useState } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';

const tabs = [
  { id: 'clients', label: 'Clients', description: 'Appears in the task client dropdown.' },
  { id: 'taskCategories', label: 'Task categories', description: 'Used when creating and filtering tasks.' },
  { id: 'goalCategories', label: 'Goal categories', description: 'Used when creating goals.' },
  { id: 'routineCategories', label: 'Routine categories', description: 'Used for daily routine items.' }
];

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

const AddonRow = memo(function AddonRow({ item, isAdmin, onStartEdit, onRemove }) {
  return (
    <tr>
      <td className="px-4 py-2 text-slate-700">{item.value}</td>
      <td className="px-4 py-2 text-slate-500">{formatDate(item.createdAt)}</td>
      <td className="px-4 py-2 text-right">
        {isAdmin ? (
          <div className="flex justify-end gap-3">
            <button onClick={() => onStartEdit(item.value)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Edit</button>
            <button onClick={() => onRemove(item.value)} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Remove</button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </td>
    </tr>
  );
});

function AddonsPage({ addons, activeUser, onAddValue, onRemoveValue, onUpdateValue }) {
  const [activeTab, setActiveTab] = useState('clients');
  const [draft, setDraft] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [editingDraft, setEditingDraft] = useState('');

  const isAdmin = activeUser?.role === 'admin';
  const currentItems = useMemo(() => addons[activeTab] || [], [addons, activeTab]);
  const tabMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  const submit = useCallback(async () => {
    if (!draft.trim()) return;
    await onAddValue(activeTab, draft.trim());
    setDraft('');
  }, [activeTab, draft, onAddValue]);

  const remove = useCallback(async (value) => {
    await onRemoveValue(activeTab, value);
  }, [activeTab, onRemoveValue]);
  const startEdit = useCallback((value) => {
    setEditingValue(value);
    setEditingDraft(value);
  }, []);
  const cancelEdit = useCallback(() => {
    setEditingValue('');
    setEditingDraft('');
  }, []);
  const saveEdit = useCallback(async () => {
    const next = editingDraft.trim();
    if (!editingValue || !next) return;
    await onUpdateValue(activeTab, editingValue, next);
    cancelEdit();
  }, [activeTab, cancelEdit, editingDraft, editingValue, onUpdateValue]);

  const renderVirtualRow = useCallback((item) => (
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <tbody>
        <AddonRow item={item} isAdmin={isAdmin} onStartEdit={startEdit} onRemove={remove} />
      </tbody>
    </table>
  ), [isAdmin, remove, startEdit]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reference data</p>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Lists</h3>
        <p className="mt-1 text-sm text-slate-500">
          Manage clients and categories. Each list powers dropdowns across the app.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((tab) => {
            const count = (addons[tab.id] || []).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label} <span className="ml-1 text-xs opacity-80">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 px-4 py-3">
            <h4 className="text-sm font-semibold text-slate-900">{tabMeta.label}</h4>
            <p className="text-xs text-slate-500">{tabMeta.description}</p>
          </div>

          <div className="border-b border-slate-100 px-4 py-3">
            {isAdmin ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    className={controlClass}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="New name..."
                  />
                  <button
                    onClick={submit}
                    className="h-10 rounded-md bg-cyan-500 px-4 text-sm font-semibold text-white hover:bg-cyan-600"
                  >
                    Add
                  </button>
                </div>
                {editingValue ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Edit item</p>
                    <div className="flex gap-2">
                      <input className={controlClass} value={editingDraft} onChange={(e) => setEditingDraft(e.target.value)} />
                      <button onClick={saveEdit} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
                      <button onClick={cancelEdit} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Only admins can add/remove list items.</p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Added</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length > 50 ? (
                  <tr>
                    <td colSpan={3} className="p-0">
                      <VirtualizedList items={currentItems} estimateSize={40} height={520} renderItem={renderVirtualRow} />
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <AddonRow key={item.value} item={item} isAdmin={isAdmin} onStartEdit={startEdit} onRemove={remove} />
                  ))
                )}
                {!currentItems.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                      No items yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddonsPage;
