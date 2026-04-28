import { memo, useCallback, useMemo, useRef, useState } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';

const labelRank = { HIGH: 1, MEDIUM: 2, LOW: 3 };

const initialFilters = {
  label: 'ALL',
  status: 'ALL',
  assigneeId: 'ALL',
  category: 'ALL',
  clientName: 'ALL',
  createdFrom: '',
  createdTo: '',
  dueFrom: '',
  dueTo: '',
  sortBy: 'created_desc'
};

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500';

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

const statusToneMap = {
  YET_TO_WORK: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700'
};

const TaskCard = memo(function TaskCard({ task, assigneeName, canDelete, canUpdateStatus, onDeleteTask, onUpdateTaskStatus }) {
  const priorityTone =
    task.label === 'HIGH'
      ? 'bg-rose-100 text-rose-700'
      : task.label === 'MEDIUM'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-emerald-100 text-emerald-700';

  return (
    <article className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {task.clientName}
        </p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityTone}`}>
          {task.label}
        </span>
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-800">{task.workDescription}</p>
      <div className="mt-2.5 space-y-1 text-xs text-slate-500">
        <p>Category: {task.category}</p>
        <p>Assignee: {assigneeName}</p>
        <p>
          Status:{' '}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusToneMap[task.status] || 'bg-slate-100 text-slate-700'}`}>
            {task.status}
          </span>
        </p>
        <p>Created by: {task.createdBy}</p>
        <p>Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</p>
      </div>
      {task.voiceNoteUrl && <audio controls src={task.voiceNoteUrl} className="mt-2.5 h-8 w-full" />}
      <div className="mt-3 flex items-center justify-between gap-2">
        {canUpdateStatus ? (
          <select
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700"
            value={task.status}
            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value)}
          >
            <option value="YET_TO_WORK">Yet to work</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        ) : (
          <span />
        )}
        {canDelete ? (
          <button
            className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
            onClick={() => onDeleteTask(task.id)}
          >
            Delete
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">Not owner</span>
        )}
      </div>
    </article>
  );
});

function TasksPage({ tasks, allUsers, activeUser, addons, onAddTask, onDeleteTask, onUpdateTaskStatus, onUploadVoiceNote }) {
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState('');
  const [form, setForm] = useState({
    clientName: addons.clients[0]?.value || '',
    workDescription: '',
    voiceNoteUrl: '',
    category: addons.taskCategories[0]?.value || '',
    assigneeId: activeUser?.id || '',
    label: 'MEDIUM',
    status: 'YET_TO_WORK',
    deadline: ''
  });

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const userNameMap = useMemo(
    () => Object.fromEntries(allUsers.map((user) => [user.id, user.name])),
    [allUsers]
  );

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (filters.label !== 'ALL') list = list.filter((task) => task.label === filters.label);
    if (filters.status !== 'ALL') list = list.filter((task) => task.status === filters.status);
    if (filters.assigneeId !== 'ALL') list = list.filter((task) => task.assigneeId === filters.assigneeId);
    if (filters.category !== 'ALL') list = list.filter((task) => task.category === filters.category);
    if (filters.clientName !== 'ALL') list = list.filter((task) => task.clientName === filters.clientName);

    if (filters.createdFrom || filters.createdTo) {
      list = list.filter((task) => inDateRange(task.createdAt, filters.createdFrom, filters.createdTo));
    }

    if (filters.dueFrom || filters.dueTo) {
      list = list.filter((task) => inDateRange(task.deadline, filters.dueFrom, filters.dueTo));
    }

    if (filters.sortBy === 'created_desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.sortBy === 'created_asc') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (filters.sortBy === 'deadline_asc') list.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
    if (filters.sortBy === 'label_asc') list.sort((a, b) => labelRank[a.label] - labelRank[b.label]);

    return list;
  }, [filters, tasks]);

  const highTasks = useMemo(() => filteredTasks.filter((task) => task.label === 'HIGH'), [filteredTasks]);
  const mediumTasks = useMemo(() => filteredTasks.filter((task) => task.label === 'MEDIUM'), [filteredTasks]);
  const lowTasks = useMemo(() => filteredTasks.filter((task) => task.label === 'LOW'), [filteredTasks]);

  const clearFilters = useCallback(() => setFilters(initialFilters), []);

  const uploadAndSetFile = useCallback(async (file) => {
    if (!file) return;
    setUploadingAudio(true);
    try {
      const uploaded = await onUploadVoiceNote(file);
      if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
      const previewUrl = URL.createObjectURL(file);
      setVoicePreviewUrl(previewUrl);
      setForm((prev) => ({ ...prev, voiceNoteUrl: uploaded.key }));
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingAudio(false);
    }
  }, [onUploadVoiceNote, voicePreviewUrl]);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      await uploadAndSetFile(file);
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }, [uploadAndSetFile]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const handleAudioUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    await uploadAndSetFile(file);
  }, [uploadAndSetFile]);

  const handleCreate = useCallback(async (event) => {
    event.preventDefault();
    try {
      await onAddTask(form);
      setForm({
        clientName: addons.clients[0]?.value || '',
        workDescription: '',
        voiceNoteUrl: '',
        category: addons.taskCategories[0]?.value || '',
        assigneeId: activeUser?.id || '',
        label: 'MEDIUM',
        status: 'YET_TO_WORK',
        deadline: ''
      });
      if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
      setVoicePreviewUrl('');
      setShowCreate(false);
    } catch (error) {
      alert(error.message);
    }
  }, [activeUser?.id, addons.clients, addons.taskCategories, form, onAddTask, voicePreviewUrl]);

  const renderTaskCard = useCallback((task) => (
    <TaskCard
      key={task.id}
      task={task}
      assigneeName={userNameMap[task.assigneeId] || '-'}
      canDelete={task.createdById === activeUser?.id}
      canUpdateStatus={activeUser?.role === 'admin' || task.assigneeId === activeUser?.id}
      onDeleteTask={onDeleteTask}
      onUpdateTaskStatus={onUpdateTaskStatus}
    />
  ), [activeUser?.id, activeUser?.role, onDeleteTask, onUpdateTaskStatus, userNameMap]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Tasks</p>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Board</h3>
          </div>
          <div className="flex items-end gap-3">
            <button
              className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
              onClick={() => setShowCreate(true)}
            >
              New task
            </button>
          </div>
        </div>

        <details className="group rounded-xl border border-slate-200">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
            <span className="flex items-center justify-between">
              <span>Filter & sort</span>
              <svg
                className="h-4 w-4 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.937a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>
          <div className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-4">
            <div>
              <label className={labelClass}>Priority</label>
              <select className={controlClass} value={filters.label} onChange={(e) => setFilters((p) => ({ ...p, label: e.target.value }))}>
                <option value="ALL">All</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Assignee</label>
              <select className={controlClass} value={filters.assigneeId} onChange={(e) => setFilters((p) => ({ ...p, assigneeId: e.target.value }))}>
                <option value="ALL">All</option>
                {allUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={controlClass} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                <option value="ALL">All</option>
                <option value="YET_TO_WORK">Yet to work</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={controlClass} value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
                <option value="ALL">All</option>
                {addons.taskCategories.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Client</label>
              <select className={controlClass} value={filters.clientName} onChange={(e) => setFilters((p) => ({ ...p, clientName: e.target.value }))}>
                <option value="ALL">All</option>
                {addons.clients.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Created from</label>
              <input type="date" className={controlClass} value={filters.createdFrom} onChange={(e) => setFilters((p) => ({ ...p, createdFrom: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Created to</label>
              <input type="date" className={controlClass} value={filters.createdTo} onChange={(e) => setFilters((p) => ({ ...p, createdTo: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Due from</label>
              <input type="date" className={controlClass} value={filters.dueFrom} onChange={(e) => setFilters((p) => ({ ...p, dueFrom: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Due to</label>
              <input type="date" className={controlClass} value={filters.dueTo} onChange={(e) => setFilters((p) => ({ ...p, dueTo: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Sort</label>
              <select className={controlClass} value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}>
                <option value="created_desc">Created — newest first</option>
                <option value="created_asc">Created — oldest first</option>
                <option value="deadline_asc">Due date — nearest first</option>
                <option value="label_asc">Priority — high to low</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          </div>
        </details>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between rounded-t-2xl border-b border-rose-100 bg-rose-50 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-700">High priority</p>
            <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{highTasks.length}</span>
          </header>
          <div className="min-h-[360px] space-y-3 p-3.5">
            {highTasks.length ? (
              highTasks.length > 50 ? (
                <VirtualizedList
                  items={highTasks}
                  estimateSize={188}
                  height={560}
                  className="space-y-3"
                  renderItem={renderTaskCard}
                />
              ) : (
                highTasks.map(renderTaskCard)
              )
            ) : (
              <p className="pt-24 text-center text-sm text-slate-400">No tasks here</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between rounded-t-2xl border-b border-amber-100 bg-amber-50 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-700">Medium priority</p>
            <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{mediumTasks.length}</span>
          </header>
          <div className="min-h-[360px] space-y-3 p-3.5">
            {mediumTasks.length ? (
              mediumTasks.length > 50 ? (
                <VirtualizedList
                  items={mediumTasks}
                  estimateSize={188}
                  height={560}
                  className="space-y-3"
                  renderItem={renderTaskCard}
                />
              ) : (
                mediumTasks.map(renderTaskCard)
              )
            ) : (
              <p className="pt-24 text-center text-sm text-slate-400">No tasks here</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between rounded-t-2xl border-b border-emerald-100 bg-emerald-50 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-700">Low priority</p>
            <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{lowTasks.length}</span>
          </header>
          <div className="min-h-[360px] space-y-3 p-3.5">
            {lowTasks.length ? (
              lowTasks.length > 50 ? (
                <VirtualizedList
                  items={lowTasks}
                  estimateSize={188}
                  height={560}
                  className="space-y-3"
                  renderItem={renderTaskCard}
                />
              ) : (
                lowTasks.map(renderTaskCard)
              )
            ) : (
              <p className="pt-24 text-center text-sm text-slate-400">No tasks here</p>
            )}
          </div>
        </section>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <form className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onSubmit={handleCreate}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tasks</p>
            <h3 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">New task</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Client</label>
                  <select required className={controlClass} value={form.clientName} onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}>
                    {addons.clients.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea required className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200" value={form.workDescription} onChange={(e) => setForm((p) => ({ ...p, workDescription: e.target.value }))} />
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <label className="mb-2 block text-[11px] font-semibold uppercase text-slate-500">Voice note (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {!isRecording ? (
                      <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white" onClick={startRecording}>Hold microphone</button>
                    ) : (
                      <button type="button" className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white" onClick={stopRecording}>Stop recording</button>
                    )}
                    <label className="cursor-pointer rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300">
                      Upload a file
                      <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                    </label>
                    {uploadingAudio && <span className="self-center text-xs text-slate-500">Uploading...</span>}
                  </div>
                  {voicePreviewUrl && <audio controls src={voicePreviewUrl} className="mt-3 w-full" />}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Category</label>
                  <select required className={controlClass} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {addons.taskCategories.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Assignee</label>
                  <select required disabled={activeUser?.role === 'user'} className={`${controlClass} disabled:bg-slate-100`} value={activeUser?.role === 'user' ? activeUser.id : form.assigneeId} onChange={(e) => setForm((p) => ({ ...p, assigneeId: e.target.value }))}>
                    {(activeUser?.role === 'admin' ? allUsers : [activeUser]).map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Priority</label>
                  <select className={controlClass} value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <select className={controlClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="YET_TO_WORK">Yet to work</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Done</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Due date (optional)</label>
                  <input type="datetime-local" className={controlClass} value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
                </div>

                <p className="border-t border-slate-100 pt-2 text-xs text-slate-400">Recorded by you: {activeUser?.name}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default TasksPage;
