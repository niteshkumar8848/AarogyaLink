const ReportsView = ({ flow, consultations, metrics }) => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="font-semibold">Patient Flow</h3>
        <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(flow, null, 2)}</pre>
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="font-semibold">Consultations</h3>
        <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(consultations, null, 2)}</pre>
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="font-semibold">Queue Metrics</h3>
        <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(metrics, null, 2)}</pre>
      </section>
    </div>
  );
};

export default ReportsView;
