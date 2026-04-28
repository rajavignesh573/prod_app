function SimplePage({ title }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">This module is scaffolded and ready after Tasks completion.</p>
    </section>
  );
}

export default SimplePage;
