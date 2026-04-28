import { useState } from 'react';

const controlClass =
  'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

function LoginView({ onLogin }) {
  const [email, setEmail] = useState('admin@flowforge.app');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100/80 p-4">
      <form className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">FlowForge Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Use your account to continue.</p>
        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input className={controlClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
            <input className={controlClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="mt-5 h-10 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default LoginView;
