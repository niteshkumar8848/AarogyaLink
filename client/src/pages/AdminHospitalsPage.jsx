import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { hospitalAPI } from '../services/api';

const initialForm = { name: '', address: '', phone: '', email: '', departments: '' };

const AdminHospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const load = async () => {
    try {
      const { data } = await hospitalAPI.list();
      setHospitals(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hospitals');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await hospitalAPI.create({
        ...form,
        departments: form.departments.split(',').map((d) => d.trim()).filter(Boolean)
      });
      setForm(initialForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create hospital');
    }
  };

  const removeHospital = async (hospital) => {
    const ok = window.confirm(`Remove "${hospital.name}" from the registered hospital list?`);
    if (!ok) return;

    setError('');
    setDeletingId(hospital._id);
    try {
      await hospitalAPI.remove(hospital._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove hospital');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <AppShell title="Manage Hospitals">
      <form onSubmit={create} className="grid gap-2 rounded-2xl bg-white p-4 shadow-card md:grid-cols-5">
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Hospital name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Departments (comma separated)" value={form.departments} onChange={(e) => setForm((p) => ({ ...p, departments: e.target.value }))} />
        <button className="rounded bg-primary px-3 py-1 text-white md:col-span-5">Add Hospital</button>
      </form>
      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-4 space-y-2">
        {hospitals.map((hospital) => (
          <div key={hospital._id} className="rounded-xl bg-white p-3 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{hospital.name}</p>
                <p className="text-sm text-teal-700">{hospital.address}</p>
              </div>
              <button
                type="button"
                className="rounded border border-red-200 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deletingId === hospital._id}
                onClick={() => removeHospital(hospital)}
              >
                {deletingId === hospital._id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminHospitalsPage;
