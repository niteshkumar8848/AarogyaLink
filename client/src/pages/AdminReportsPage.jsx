import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import ReportsView from '../components/admin/ReportsView';
import { reportAPI } from '../services/api';

const AdminReportsPage = () => {
  const [flow, setFlow] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [revenue, setRevenue] = useState({ overview: {}, byDoctor: [], daily: [] });

  useEffect(() => {
    const load = async () => {
      const [flowRes, consultationRes, metricsRes, revenueRes] = await Promise.all([
        reportAPI.flow(),
        reportAPI.consultations(),
        reportAPI.queueMetrics(),
        reportAPI.revenue()
      ]);
      setFlow(flowRes.data);
      setConsultations(consultationRes.data);
      setMetrics(metricsRes.data);
      setRevenue(revenueRes.data || { overview: {}, byDoctor: [], daily: [] });
    };

    load();
    const intervalId = setInterval(load, 15000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AppShell title="Reports & Analytics">
      <ReportsView flow={flow} consultations={consultations} metrics={metrics} revenue={revenue} />
    </AppShell>
  );
};

export default AdminReportsPage;
