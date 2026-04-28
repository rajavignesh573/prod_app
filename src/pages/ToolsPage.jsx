import { useEffect, useMemo, useState } from 'react';

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const h = String(Math.floor(safe / 3600)).padStart(2, '0');
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, '0');
  const s = String(safe % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function ToolsPage() {
  const [activeTab, setActiveTab] = useState('todo');
  const [todoInput, setTodoInput] = useState('');
  const [todos, setTodos] = usePersistentState('tools_todos_v1', []);
  const [notes, setNotes] = usePersistentState('tools_notes_v1', '');

  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = usePersistentState('tools_pomodoro_seconds_v1', 25 * 60);

  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  const [timerInputMinutes, setTimerInputMinutes] = useState(5);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(5 * 60);

  useEffect(() => {
    if (!pomodoroRunning) return undefined;
    const id = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          setPomodoroRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pomodoroRunning, setPomodoroSeconds]);

  useEffect(() => {
    if (!stopwatchRunning) return undefined;
    const id = setInterval(() => setStopwatchSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(id);
  }, [stopwatchRunning]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const todoStats = useMemo(() => {
    const done = todos.filter((item) => item.done).length;
    return { done, open: todos.length - done, total: todos.length };
  }, [todos]);

  const addTodo = () => {
    const value = todoInput.trim();
    if (!value) return;
    setTodos((prev) => [{ id: crypto.randomUUID(), text: value, done: false }, ...prev]);
    setTodoInput('');
  };

  const removeTodo = (id) => setTodos((prev) => prev.filter((item) => item.id !== id));
  const toggleTodo = (id) =>
    setTodos((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const tabs = [
    { id: 'todo', label: 'To-do' },
    { id: 'notes', label: 'Notes' },
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'stopwatch', label: 'Stopwatch' },
    { id: 'timer', label: 'Timer' }
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Productivity</p>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Tools</h3>
        <p className="mt-1 text-sm text-slate-500">
          To-do and notes sync across refresh. Pomodoro, stopwatch and timer run in this tab.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          {activeTab === 'todo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">{todoStats.open} open · {todoStats.done} done · {todoStats.total} total</p>
              <div className="flex gap-2">
                <input
                  className={controlClass}
                  placeholder="Add an item..."
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={(e) => (e.key === 'Enter' ? addTodo() : null)}
                />
                <button onClick={addTodo} className="h-10 rounded-md bg-cyan-500 px-4 text-sm font-semibold text-white hover:bg-cyan-600">Add</button>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Done</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase">Task</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todos.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={item.done} onChange={() => toggleTodo(item.id)} />
                        </td>
                        <td className={`px-3 py-2 ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</td>
                        <td className="px-3 py-2 text-right">
                          <button className="text-xs font-semibold text-rose-600 hover:text-rose-700" onClick={() => removeTodo(item.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                    {!todos.length && (
                      <tr><td colSpan={3} className="px-3 py-8 text-center text-sm text-slate-400">No tasks yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <textarea
                className="min-h-64 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="Write your notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'pomodoro' && (
            <div className="space-y-3">
              <p className="text-4xl font-bold text-slate-900">{formatSeconds(pomodoroSeconds)}</p>
              <div className="flex gap-2">
                <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" onClick={() => setPomodoroRunning(true)}>Start</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setPomodoroRunning(false)}>Pause</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => { setPomodoroRunning(false); setPomodoroSeconds(25 * 60); }}>Reset 25:00</button>
              </div>
            </div>
          )}

          {activeTab === 'stopwatch' && (
            <div className="space-y-3">
              <p className="text-4xl font-bold text-slate-900">{formatSeconds(stopwatchSeconds)}</p>
              <div className="flex gap-2">
                <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" onClick={() => setStopwatchRunning(true)}>Start</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setStopwatchRunning(false)}>Pause</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => { setStopwatchRunning(false); setStopwatchSeconds(0); }}>Reset</button>
              </div>
            </div>
          )}

          {activeTab === 'timer' && (
            <div className="space-y-3">
              <p className="text-4xl font-bold text-slate-900">{formatSeconds(timerSeconds)}</p>
              <div className="flex items-end gap-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Minutes</p>
                  <input
                    type="number"
                    min="1"
                    className={controlClass}
                    value={timerInputMinutes}
                    onChange={(e) => setTimerInputMinutes(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                <button
                  className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => { setTimerRunning(false); setTimerSeconds(timerInputMinutes * 60); }}
                >
                  Set
                </button>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" onClick={() => setTimerRunning(true)}>Start</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setTimerRunning(false)}>Pause</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}>Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ToolsPage;
