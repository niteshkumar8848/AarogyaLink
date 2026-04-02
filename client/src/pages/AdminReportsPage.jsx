import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import ReportsView from '../components/admin/ReportsView';
import { reportAPI } from '../services/api';

const AdminReportsPage = () => {
  const [flow, setFlow] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const load = async () => {
      const [flowRes, consultationRes, metricsRes] = await Promise.all([
        reportAPI.flow(),
        reportAPI.consultations(),
        reportAPI.queueMetrics()
      ]);
      setFlow(flowRes.data);
      setConsultations(consultationRes.data);
      setMetrics(metricsRes.data);
    };

    load();
  }, []);

  return (
    <AppShell title="Reports & Analytics">
      <ReportsView flow={flow} consultations={consultations} metrics={metrics} />
    </AppShell>
  );
};

export default AdminReportsPage;
