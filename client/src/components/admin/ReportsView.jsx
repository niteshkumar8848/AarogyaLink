const ReportsView = ({ flow, consultations, metrics, revenue }) => {
  const flowMax = Math.max(...(flow || []).map((item) => Number(item.total || 0)), 1);
  const revenueDaily = revenue?.daily || [];
  const revenueDailyMax = Math.max(...revenueDaily.map((item) => Number(item.revenue || 0)), 1);
  const totalRevenue = Number(revenue?.overview?.totalRevenue || 0);
  const paidAppointments = Number(revenue?.overview?.totalPaidAppointments || 0);
  const topDoctor = (revenue?.byDoctor || [])[0];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-primary">NPR {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Successful Payments</p>
          <p className="mt-2 text-2xl font-bold text-primary">{paidAppointments}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Avg. Service Time</p>
          <p className="mt-2 text-2xl font-bold text-primary">{Number(metrics?.averageServiceTimeMinutes || 0)} min</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-sm text-teal-700">Top Earning Doctor</p>
          <p className="mt-2 text-lg font-semibold text-ink">{topDoctor?.doctorName || '-'}</p>
          <p className="text-sm text-teal-700">NPR {Number(topDoctor?.revenue || 0).toLocaleString()}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold text-ink">Patient Flow Trend</h3>
          <div className="mt-3 flex items-end gap-3 overflow-x-auto">
            {(flow || []).map((item) => {
              const bar = Math.max(8, Math.round((Number(item.total || 0) / flowMax) * 140));
              return (
                <div key={item._id} className="min-w-[70px] text-center">
                  <p className="mb-1 text-xs text-slate-600">{item.total}</p>
                  <div className="mx-auto w-10 rounded-t bg-teal-500" style={{ height: `${bar}px` }} />
                  <p className="mt-1 text-[11px] text-slate-500">{String(item._id || '').slice(5)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold text-ink">Revenue Trend</h3>
          <div className="mt-3 flex items-end gap-3 overflow-x-auto">
            {revenueDaily.map((item) => {
              const bar = Math.max(8, Math.round((Number(item.revenue || 0) / revenueDailyMax) * 140));
              return (
                <div key={item.date} className="min-w-[80px] text-center">
                  <p className="mb-1 text-xs text-slate-600">{Number(item.revenue || 0).toLocaleString()}</p>
                  <div className="mx-auto w-10 rounded-t bg-emerald-500" style={{ height: `${bar}px` }} />
                  <p className="mt-1 text-[11px] text-slate-500">{String(item.date || '').slice(5)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold text-ink">Consultations By Doctor</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-teal-100 text-teal-700">
                  <th className="py-2 pr-2">Doctor ID</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2">Completed</th>
                </tr>
              </thead>
              <tbody>
                {(consultations || []).map((row) => (
                  <tr key={row._id} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{String(row._id || '-')}</td>
                    <td className="py-2 pr-2">{row.totalConsultations || 0}</td>
                    <td className="py-2">{row.completedConsultations || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="font-semibold text-ink">Doctor Revenue Breakdown</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-teal-100 text-teal-700">
                  <th className="py-2 pr-2">Doctor</th>
                  <th className="py-2 pr-2">Specialization</th>
                  <th className="py-2 pr-2">Appointments</th>
                  <th className="py-2">Revenue (NPR)</th>
                </tr>
              </thead>
              <tbody>
                {(revenue?.byDoctor || []).map((row) => (
                  <tr key={row.doctorId || row.doctorName} className="border-b border-slate-100">
                    <td className="py-2 pr-2">{row.doctorName || '-'}</td>
                    <td className="py-2 pr-2">{row.specialization || '-'}</td>
                    <td className="py-2 pr-2">{row.appointments || 0}</td>
                    <td className="py-2">{Number(row.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-card">
        <h3 className="font-semibold text-ink">Queue Metrics</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 text-sm">
            <p className="text-teal-700">Average Service Time</p>
            <p className="text-xl font-semibold text-ink">{Number(metrics?.averageServiceTimeMinutes || 0)} min</p>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 text-sm">
            <p className="text-teal-700">Samples Used</p>
            <p className="text-xl font-semibold text-ink">{metrics?.sampleSize || 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsView;
